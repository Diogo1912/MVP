from rest_framework import serializers
from .models import UsageMetric, AuditLog


class UsageMetricSerializer(serializers.ModelSerializer):
    class Meta:
        model = UsageMetric
        fields = ['id', 'metric_type', 'value', 'metadata', 'created_at']
        read_only_fields = ['id', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = AuditLog
        fields = ['id', 'action', 'resource_type', 'resource_id', 'ip_address', 'created_at']
        read_only_fields = ['id', 'created_at']

