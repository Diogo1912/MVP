from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User


class UsageMetric(models.Model):
    """Track AI usage and productivity metrics"""
    
    METRIC_TYPE_CHOICES = [
        ('document_uploaded', _('Document Uploaded')),
        ('document_analyzed', _('Document Analyzed')),
        ('document_generated', _('Document Generated')),
        ('ai_query', _('AI Query')),
        ('conversation_started', _('Conversation Started')),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='usage_metrics')
    metric_type = models.CharField(max_length=50, choices=METRIC_TYPE_CHOICES)
    value = models.FloatField(default=1.0)  # Can be count, duration, etc.
    metadata = models.JSONField(default=dict, blank=True)  # Additional data
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'metric_type', 'created_at']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = _('usage metric')
        verbose_name_plural = _('usage metrics')
    
    def __str__(self):
        return f"{self.user.email} - {self.get_metric_type_display()}"


class AuditLog(models.Model):
    """Audit log for GDPR compliance"""
    
    ACTION_CHOICES = [
        ('login', _('Login')),
        ('logout', _('Logout')),
        ('document_access', _('Document Access')),
        ('document_delete', _('Document Delete')),
        ('data_export', _('Data Export')),
        ('data_delete', _('Data Delete')),
        ('settings_change', _('Settings Change')),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=50, choices=ACTION_CHOICES)
    resource_type = models.CharField(max_length=50, blank=True)  # e.g., 'document', 'case'
    resource_id = models.PositiveIntegerField(null=True, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    user_agent = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['user', 'action', 'created_at']),
            models.Index(fields=['created_at']),
        ]
        verbose_name = _('audit log')
        verbose_name_plural = _('audit logs')
    
    def __str__(self):
        return f"{self.get_action_display()} - {self.user.email if self.user else 'System'}"
