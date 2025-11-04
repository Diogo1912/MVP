from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum
from datetime import timedelta
from .models import UsageMetric, AuditLog
from documents.models import Document
from cases.models import Case
from ai_agent.models import Conversation


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        last_30_days = now - timedelta(days=30)
        
        # Document metrics
        total_documents = Document.objects.filter(user=user).count()
        documents_this_month = Document.objects.filter(
            user=user,
            created_at__gte=last_30_days
        ).count()
        
        # Case metrics
        total_cases = Case.objects.filter(lawyer=user).count()
        active_cases = Case.objects.filter(lawyer=user, status='open').count()
        
        # AI usage metrics
        ai_queries = UsageMetric.objects.filter(
            user=user,
            metric_type='ai_query',
            created_at__gte=last_30_days
        ).count()
        
        total_tokens = UsageMetric.objects.filter(
            user=user,
            metric_type='ai_query',
            created_at__gte=last_30_days
        ).aggregate(total=Sum('value'))['total'] or 0
        
        # Conversations
        total_conversations = Conversation.objects.filter(user=user).count()
        
        return Response({
            'documents': {
                'total': total_documents,
                'this_month': documents_this_month,
            },
            'cases': {
                'total': total_cases,
                'active': active_cases,
            },
            'ai_usage': {
                'queries': ai_queries,
                'tokens': total_tokens,
            },
            'conversations': {
                'total': total_conversations,
            },
        })


class AuditLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        logs = AuditLog.objects.filter(user=user).order_by('-created_at')[:100]
        
        from .serializers import AuditLogSerializer
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)
