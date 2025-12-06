from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from .models import Conversation, Message, Prompt, KnowledgeBase
from .services import AIService
from documents.models import Document
from analytics.models import UsageMetric
import json


class ConversationViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Conversation.objects.filter(user=self.request.user).order_by('-updated_at')
    
    def get_serializer_class(self):
        from .serializers import ConversationSerializer
        return ConversationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, language=self.request.user.language)
    
    @action(detail=True, methods=['get'])
    def messages(self, request, pk=None):
        """Get all messages for a conversation"""
        conversation = self.get_object()
        messages = Message.objects.filter(conversation=conversation).order_by('created_at')
        from .serializers import MessageSerializer
        return Response(MessageSerializer(messages, many=True).data)


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            return Message.objects.filter(
                conversation_id=conversation_id,
                conversation__user=self.request.user
            ).order_by('created_at')
        return Message.objects.filter(conversation__user=self.request.user).order_by('-created_at')
    
    def get_serializer_class(self):
        from .serializers import MessageSerializer
        return MessageSerializer


class PromptViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Prompt.objects.all().order_by('name', '-version')
    
    def get_serializer_class(self):
        from .serializers import PromptSerializer
        return PromptSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active prompts"""
        prompts = Prompt.objects.filter(is_active=True)
        from .serializers import PromptSerializer
        return Response(PromptSerializer(prompts, many=True).data)


class KnowledgeBaseViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return KnowledgeBase.objects.filter(document__user=self.request.user)
    
    def get_serializer_class(self):
        from .serializers import KnowledgeBaseSerializer
        return KnowledgeBaseSerializer


class ChatView(APIView):
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        """Handle chat message and get AI response"""
        user = request.user
        message_content = request.data.get('message', '')
        conversation_id = request.data.get('conversation_id')
        document_id = request.data.get('document_id')
        persona = request.data.get('persona', 'commercial')  # commercial or personal
        use_knowledge_base = request.data.get('use_knowledge_base', False)
        
        if not message_content:
            return Response({'error': 'Message is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Get or create conversation
        if conversation_id:
            try:
                conversation = Conversation.objects.get(id=conversation_id, user=user)
            except Conversation.DoesNotExist:
                return Response({'error': 'Conversation not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            conversation = Conversation.objects.create(
                user=user,
                language=user.language,
                title=message_content[:50],
                metadata={'persona': persona}
            )
        
        # Get document context if provided
        document_context = None
        document = None
        if document_id:
            try:
                document = Document.objects.get(id=document_id, user=user)
                document_context = document.content_text[:2000] if document.content_text else None
            except Document.DoesNotExist:
                pass
        
        # Save user message
        user_message = Message.objects.create(
            conversation=conversation,
            role='user',
            content=message_content,
            document=document
        )
        
        # Get conversation history
        previous_messages = Message.objects.filter(
            conversation=conversation
        ).exclude(id=user_message.id).order_by('created_at')[:10]
        
        messages = [
            {"role": msg.role, "content": msg.content}
            for msg in previous_messages
        ]
        messages.append({"role": "user", "content": message_content})
        
        # Get AI response
        try:
            ai_service = AIService()
        except Exception as e:
            # AI service initialization failed (likely missing API key)
            import traceback
            error_msg = str(e)
            print(f"AI Service Init Error: {error_msg}")
            print(f"Traceback: {traceback.format_exc()}")
            if 'API key' in error_msg or 'OPENAI' in error_msg:
                error_msg = "AI service not configured. Please set OPENAI_API_KEY in environment variables."
            return Response(
                {'error': error_msg},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )
        
        try:
            response = ai_service.chat_completion(
                messages=messages,
                language=user.language,
                persona=persona,
                use_knowledge_base=use_knowledge_base,
                document_context=document_context
            )
            
            # Save AI message
            ai_message = Message.objects.create(
                conversation=conversation,
                role='assistant',
                content=response['content'],
                tokens_used=response['tokens_used'],
                document=document
            )
            
            # Update conversation
            conversation.updated_at = timezone.now()
            conversation.save()
            
            # Track usage
            UsageMetric.objects.create(
                user=user,
                metric_type='ai_query',
                value=response['tokens_used'],
                metadata={
                    'conversation_id': conversation.id,
                    'persona': persona
                }
            )
            
            from .serializers import MessageSerializer
            return Response({
                'conversation_id': conversation.id,
                'message': MessageSerializer(ai_message).data,
                'user_message': MessageSerializer(user_message).data,
            })
            
        except Exception as e:
            import traceback
            error_msg = str(e)
            print(f"AI Chat Error: {error_msg}")
            print(f"Traceback: {traceback.format_exc()}")
            # Clean up error message for users
            if 'API key' in error_msg:
                error_msg = "AI service authentication failed. Please check OPENAI_API_KEY."
            return Response(
                {'error': error_msg},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class RegenerateView(APIView):
    """Regenerate an AI response with additional instructions"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        message_id = request.data.get('message_id')
        additional_instructions = request.data.get('instructions', '')
        
        if not message_id:
            return Response({'error': 'Message ID is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Get the original AI message
            ai_message = Message.objects.get(
                id=message_id,
                role='assistant',
                conversation__user=request.user
            )
            
            # Get the user message that triggered this response
            user_message = Message.objects.filter(
                conversation=ai_message.conversation,
                role='user',
                created_at__lt=ai_message.created_at
            ).order_by('-created_at').first()
            
            if not user_message:
                return Response({'error': 'Original user message not found'}, status=status.HTTP_404_NOT_FOUND)
            
            # Regenerate response
            ai_service = AIService()
            response = ai_service.regenerate_response(
                original_message=user_message.content,
                previous_response=ai_message.content,
                additional_instructions=additional_instructions,
                language=request.user.language
            )
            
            # Create new AI message
            new_ai_message = Message.objects.create(
                conversation=ai_message.conversation,
                role='assistant',
                content=response['content'],
                tokens_used=response['tokens_used'],
                document=ai_message.document
            )
            
            # Track usage
            UsageMetric.objects.create(
                user=request.user,
                metric_type='ai_query',
                value=response['tokens_used'],
                metadata={
                    'conversation_id': ai_message.conversation.id,
                    'regeneration': True
                }
            )
            
            from .serializers import MessageSerializer
            return Response({
                'message': MessageSerializer(new_ai_message).data,
            })
            
        except Message.DoesNotExist:
            return Response({'error': 'Message not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class GenerateDocumentView(APIView):
    """Generate a document from AI content"""
    permission_classes = [IsAuthenticated]
    
    def post(self, request):
        content = request.data.get('content', '')
        title = request.data.get('title', 'AI Generated Document')
        document_type = request.data.get('type', 'docx')
        
        if not content:
            return Response({'error': 'Content is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Create a document record
            document = Document.objects.create(
                user=request.user,
                title=title,
                file_type='ai_generated',
                content_text=content,
                is_ai_generated=True
            )
            
            # Track usage
            UsageMetric.objects.create(
                user=request.user,
                metric_type='document_created',
                value=1,
                metadata={'document_id': document.id, 'ai_generated': True}
            )
            
            from documents.serializers import DocumentSerializer
            return Response({
                'document': DocumentSerializer(document).data,
            })
            
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
