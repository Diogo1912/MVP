from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from django.contrib.auth import get_user_model
from django.utils import timezone
from datetime import timedelta
import json
from .serializers import UserSerializer, UserRegistrationSerializer
from analytics.models import AuditLog
from documents.models import Document
from cases.models import Case
from ai_agent.models import Conversation, Message

User = get_user_model()


class RegisterView(APIView):
    """User registration endpoint"""
    permission_classes = [AllowAny]
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response({
                'id': user.id,
                'email': user.email,
                'message': 'User created successfully'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class UserViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return User.objects.all()
        return User.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)
    
    @action(detail=False, methods=['patch'])
    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            AuditLog.objects.create(
                user=user,
                action='settings_change',
                metadata={'updated_fields': list(request.data.keys())}
            )
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['post'])
    def export_data(self, request):
        """Export all user data for GDPR compliance"""
        user = request.user
        
        # Collect all user data
        data = {
            'user_profile': UserSerializer(user).data,
            'documents': [],
            'cases': [],
            'conversations': [],
            'audit_logs': [],
        }
        
        # Documents
        for doc in Document.objects.filter(user=user):
            data['documents'].append({
                'id': doc.id,
                'title': doc.title,
                'file_type': doc.file_type,
                'created_at': doc.created_at.isoformat(),
                'file_size': doc.file_size,
            })
        
        # Cases
        for case in Case.objects.filter(lawyer=user):
            data['cases'].append({
                'id': case.id,
                'title': case.title,
                'description': case.description,
                'priority': case.priority,
                'status': case.status,
                'created_at': case.created_at.isoformat(),
            })
        
        # Conversations
        for conv in Conversation.objects.filter(user=user):
            messages_data = []
            for msg in conv.messages.all():
                messages_data.append({
                    'role': msg.role,
                    'content': msg.content,
                    'created_at': msg.created_at.isoformat(),
                })
            data['conversations'].append({
                'id': conv.id,
                'title': conv.title,
                'language': conv.language,
                'messages': messages_data,
                'created_at': conv.created_at.isoformat(),
            })
        
        # Audit logs
        for log in AuditLog.objects.filter(user=user):
            data['audit_logs'].append({
                'action': log.action,
                'resource_type': log.resource_type,
                'created_at': log.created_at.isoformat(),
            })
        
        # Log the export
        AuditLog.objects.create(
            user=user,
            action='data_export',
            metadata={'exported_at': timezone.now().isoformat()}
        )
        
        return Response(data)
    
    @action(detail=False, methods=['post'])
    def delete_data(self, request):
        """Delete all user data for GDPR compliance"""
        user = request.user
        confirmation = request.data.get('confirmation')
        
        if confirmation != 'DELETE_ALL_MY_DATA':
            return Response(
                {'error': 'Confirmation required. Send confirmation: "DELETE_ALL_MY_DATA"'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Delete user data (in reverse order of dependencies)
        Message.objects.filter(conversation__user=user).delete()
        Conversation.objects.filter(user=user).delete()
        Document.objects.filter(user=user).delete()
        Case.objects.filter(lawyer=user).delete()
        AuditLog.objects.filter(user=user).delete()
        
        # Log the deletion
        AuditLog.objects.create(
            user=user,
            action='data_delete',
            metadata={'deleted_at': timezone.now().isoformat()}
        )
        
        # Optionally delete the user account itself
        # user.delete()  # Uncomment if you want to delete the account too
        
        return Response({'message': 'All user data has been deleted'})
