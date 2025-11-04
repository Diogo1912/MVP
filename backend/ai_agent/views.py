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
        return Conversation.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        from .serializers import ConversationSerializer
        return ConversationSerializer
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, language=self.request.user.language)


class MessageViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        conversation_id = self.request.query_params.get('conversation')
        if conversation_id:
            return Message.objects.filter(
                conversation_id=conversation_id,
                conversation__user=self.request.user
            )
        return Message.objects.filter(conversation__user=self.request.user)
    
    def get_serializer_class(self):
        from .serializers import MessageSerializer
        return MessageSerializer


class PromptViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Prompt.objects.all()
    
    def get_serializer_class(self):
        from .serializers import PromptSerializer
        return PromptSerializer


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
                title=message_content[:50]
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
            response = ai_service.chat_completion(
                messages=messages,
                language=user.language,
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
                metadata={'conversation_id': conversation.id}
            )
            
            from .serializers import MessageSerializer
            return Response({
                'conversation_id': conversation.id,
                'message': MessageSerializer(ai_message).data,
                'user_message': MessageSerializer(user_message).data,
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
