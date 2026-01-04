from django.urls import path
from .views import AnalyticsView, AuditLogView, ExportReportView

urlpatterns = [
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('analytics/export/', ExportReportView.as_view(), name='analytics-export'),
    path('audit-logs/', AuditLogView.as_view(), name='audit-logs'),
]

