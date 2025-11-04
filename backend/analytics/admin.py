from django.contrib import admin
from .models import UsageMetric, AuditLog


@admin.register(UsageMetric)
class UsageMetricAdmin(admin.ModelAdmin):
    list_display = ['user', 'metric_type', 'value', 'created_at']
    list_filter = ['metric_type', 'created_at']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ['user', 'action', 'resource_type', 'ip_address', 'created_at']
    list_filter = ['action', 'resource_type', 'created_at']
    readonly_fields = ['created_at']
    date_hierarchy = 'created_at'
    search_fields = ['user__email', 'ip_address']
