from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db.models import Sum, Count
from django.db.models.functions import TruncDate
from datetime import timedelta
from .models import UsageMetric, AuditLog
from documents.models import Document
from cases.models import Case
from ai_agent.models import Conversation
import json


class AnalyticsView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        now = timezone.now()
        
        # Get date range from query params (7d, 30d, 90d)
        range_param = request.query_params.get('range', '30d')
        if range_param == '7d':
            days = 7
        elif range_param == '90d':
            days = 90
        else:
            days = 30
        
        date_from = now - timedelta(days=days)
        
        # Document metrics
        total_documents = Document.objects.filter(user=user).count()
        documents_in_range = Document.objects.filter(
            user=user,
            created_at__gte=date_from
        ).count()
        
        # AI-generated documents
        ai_generated_docs = Document.objects.filter(
            user=user,
            is_ai_generated=True
        ).count()
        
        # Document types breakdown
        pdf_count = Document.objects.filter(user=user, original_filename__iendswith='.pdf').count()
        docx_count = Document.objects.filter(user=user, original_filename__iendswith='.docx').count()
        
        # Documents by day for chart
        from django.db.models import Q
        documents_by_day_qs = Document.objects.filter(
            user=user,
            created_at__gte=date_from
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            total=Count('id'),
            uploaded=Count('id', filter=Q(is_ai_generated=False)),
            generated=Count('id', filter=Q(is_ai_generated=True))
        ).order_by('date')
        
        # Build a complete timeline with all days
        documents_by_day = []
        current_date = date_from.date()
        end_date = now.date()
        day_data = {item['date']: item for item in documents_by_day_qs}
        
        while current_date <= end_date:
            if current_date in day_data:
                documents_by_day.append({
                    'date': current_date.isoformat(),
                    'total': day_data[current_date]['total'],
                    'uploaded': day_data[current_date]['uploaded'],
                    'generated': day_data[current_date]['generated'],
                })
            else:
                documents_by_day.append({
                    'date': current_date.isoformat(),
                    'total': 0,
                    'uploaded': 0,
                    'generated': 0,
                })
            current_date += timedelta(days=1)
        
        # AI queries by day
        ai_queries_by_day_qs = UsageMetric.objects.filter(
            user=user,
            metric_type='ai_query',
            created_at__gte=date_from
        ).annotate(
            date=TruncDate('created_at')
        ).values('date').annotate(
            count=Count('id')
        ).order_by('date')
        
        ai_queries_by_day = []
        current_date = date_from.date()
        query_data = {item['date']: item['count'] for item in ai_queries_by_day_qs}
        
        while current_date <= end_date:
            ai_queries_by_day.append({
                'date': current_date.isoformat(),
                'count': query_data.get(current_date, 0)
            })
            current_date += timedelta(days=1)
        
        # Case metrics
        total_cases = Case.objects.filter(lawyer=user).count()
        cases_by_status = {
            'open': Case.objects.filter(lawyer=user, status='open').count(),
            'in_progress': Case.objects.filter(lawyer=user, status='in_progress').count(),
            'closed': Case.objects.filter(lawyer=user, status='closed').count(),
        }
        cases_by_priority = {
            'low': Case.objects.filter(lawyer=user, priority='low').count(),
            'medium': Case.objects.filter(lawyer=user, priority='medium').count(),
            'high': Case.objects.filter(lawyer=user, priority='high').count(),
            'urgent': Case.objects.filter(lawyer=user, priority='urgent').count(),
        }
        
        # AI usage metrics
        ai_queries = UsageMetric.objects.filter(
            user=user,
            metric_type='ai_query',
            created_at__gte=date_from
        ).count()
        
        total_tokens = UsageMetric.objects.filter(
            user=user,
            metric_type='ai_query',
            created_at__gte=date_from
        ).aggregate(total=Sum('value'))['total'] or 0
        
        # Documents analyzed
        documents_analyzed = UsageMetric.objects.filter(
            user=user,
            metric_type='document_analyzed',
            created_at__gte=date_from
        ).count()
        
        # Documents generated
        documents_generated = UsageMetric.objects.filter(
            user=user,
            metric_type='document_created',
            created_at__gte=date_from
        ).count()
        
        # Conversations
        total_conversations = Conversation.objects.filter(user=user).count()
        conversations_in_range = Conversation.objects.filter(
            user=user,
            created_at__gte=date_from
        ).count()
        
        # Recent activity
        recent_activity = []
        
        # Get recent documents
        recent_docs = Document.objects.filter(user=user).order_by('-created_at')[:5]
        for doc in recent_docs:
            recent_activity.append({
                'type': 'document',
                'action': 'AI Generated' if doc.is_ai_generated else 'Uploaded',
                'title': doc.title,
                'time': doc.created_at.isoformat()
            })
        
        # Get recent cases
        recent_cases = Case.objects.filter(lawyer=user).order_by('-created_at')[:5]
        for case in recent_cases:
            recent_activity.append({
                'type': 'case',
                'action': 'Created',
                'title': case.title,
                'time': case.created_at.isoformat()
            })
        
        # Sort by time
        recent_activity.sort(key=lambda x: x['time'], reverse=True)
        recent_activity = recent_activity[:10]
        
        # Calculate time saved (estimate: 1 AI query = 15 min, 1 doc analysis = 30 min)
        time_saved_minutes = (ai_queries * 15) + (documents_analyzed * 30) + (documents_generated * 45)
        time_saved_hours = round(time_saved_minutes / 60, 1)
        
        return Response({
            'range': range_param,
            'documents': {
                'total': total_documents,
                'in_range': documents_in_range,
                'ai_generated': ai_generated_docs,
                'uploaded': total_documents - ai_generated_docs,
                'pdf_count': pdf_count,
                'docx_count': docx_count,
                'other_count': total_documents - pdf_count - docx_count,
            },
            'documents_by_day': documents_by_day,
            'ai_queries_by_day': ai_queries_by_day,
            'cases': {
                'total': total_cases,
                'active': cases_by_status['open'] + cases_by_status['in_progress'],
                'by_status': cases_by_status,
                'by_priority': cases_by_priority,
            },
            'ai_usage': {
                'queries': ai_queries,
                'tokens': total_tokens,
                'documents_analyzed': documents_analyzed,
                'documents_generated': documents_generated,
            },
            'conversations': {
                'total': total_conversations,
                'in_range': conversations_in_range,
            },
            'time_saved': {
                'hours': time_saved_hours,
                'minutes': time_saved_minutes,
            },
            'recent_activity': recent_activity,
        })


class AuditLogView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        user = request.user
        logs = AuditLog.objects.filter(user=user).order_by('-created_at')[:100]
        
        from .serializers import AuditLogSerializer
        serializer = AuditLogSerializer(logs, many=True)
        return Response(serializer.data)


class ExportReportView(APIView):
    """Export analytics report as CSV or JSON"""
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        from django.http import HttpResponse
        import csv
        import io
        
        user = request.user
        export_format = request.query_params.get('format', 'csv')
        range_param = request.query_params.get('range', '30d')
        
        if range_param == '7d':
            days = 7
        elif range_param == '90d':
            days = 90
        else:
            days = 30
        
        now = timezone.now()
        date_from = now - timedelta(days=days)
        
        # Gather data
        documents = Document.objects.filter(user=user, created_at__gte=date_from)
        cases = Case.objects.filter(lawyer=user, created_at__gte=date_from)
        ai_queries = UsageMetric.objects.filter(
            user=user,
            metric_type='ai_query',
            created_at__gte=date_from
        ).count()
        
        if export_format == 'json':
            data = {
                'report_date': now.isoformat(),
                'range': f'{days} days',
                'summary': {
                    'total_documents': documents.count(),
                    'ai_generated_documents': documents.filter(is_ai_generated=True).count(),
                    'uploaded_documents': documents.filter(is_ai_generated=False).count(),
                    'total_cases': cases.count(),
                    'open_cases': cases.filter(status='open').count(),
                    'in_progress_cases': cases.filter(status='in_progress').count(),
                    'closed_cases': cases.filter(status='closed').count(),
                    'ai_queries': ai_queries,
                },
                'documents': [
                    {
                        'title': doc.title,
                        'type': 'AI Generated' if doc.is_ai_generated else 'Uploaded',
                        'created_at': doc.created_at.isoformat(),
                        'status': doc.status,
                        'priority': doc.priority,
                    }
                    for doc in documents
                ],
                'cases': [
                    {
                        'title': case.title,
                        'status': case.status,
                        'priority': case.priority,
                        'created_at': case.created_at.isoformat(),
                    }
                    for case in cases
                ],
            }
            
            response = HttpResponse(
                json.dumps(data, indent=2),
                content_type='application/json'
            )
            response['Content-Disposition'] = f'attachment; filename="golexai_report_{now.strftime("%Y%m%d")}.json"'
            return response
        
        else:  # CSV
            output = io.StringIO()
            writer = csv.writer(output)
            
            # Header
            writer.writerow(['GOLEXAI Analytics Report'])
            writer.writerow([f'Generated: {now.strftime("%Y-%m-%d %H:%M")}'])
            writer.writerow([f'Period: Last {days} days'])
            writer.writerow([])
            
            # Summary
            writer.writerow(['Summary'])
            writer.writerow(['Metric', 'Value'])
            writer.writerow(['Total Documents', documents.count()])
            writer.writerow(['AI Generated Documents', documents.filter(is_ai_generated=True).count()])
            writer.writerow(['Uploaded Documents', documents.filter(is_ai_generated=False).count()])
            writer.writerow(['Total Cases', cases.count()])
            writer.writerow(['Open Cases', cases.filter(status='open').count()])
            writer.writerow(['In Progress Cases', cases.filter(status='in_progress').count()])
            writer.writerow(['Closed Cases', cases.filter(status='closed').count()])
            writer.writerow(['AI Queries', ai_queries])
            writer.writerow([])
            
            # Documents
            writer.writerow(['Documents'])
            writer.writerow(['Title', 'Type', 'Status', 'Priority', 'Created At'])
            for doc in documents:
                writer.writerow([
                    doc.title,
                    'AI Generated' if doc.is_ai_generated else 'Uploaded',
                    doc.status,
                    doc.priority,
                    doc.created_at.strftime('%Y-%m-%d %H:%M')
                ])
            writer.writerow([])
            
            # Cases
            writer.writerow(['Cases'])
            writer.writerow(['Title', 'Status', 'Priority', 'Created At'])
            for case in cases:
                writer.writerow([
                    case.title,
                    case.status,
                    case.priority,
                    case.created_at.strftime('%Y-%m-%d %H:%M')
                ])
            
            response = HttpResponse(
                output.getvalue(),
                content_type='text/csv'
            )
            response['Content-Disposition'] = f'attachment; filename="golexai_report_{now.strftime("%Y%m%d")}.csv"'
            return response
