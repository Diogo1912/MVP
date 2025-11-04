from django.urls import path
from .views import AnalyticsView, AuditLogView

urlpatterns = [
    path('analytics/', AnalyticsView.as_view(), name='analytics'),
    path('audit-logs/', AuditLogView.as_view(), name='audit-logs'),
]

