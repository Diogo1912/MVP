from rest_framework import serializers
from .models import Case
from accounts.serializers import UserSerializer


class CaseSerializer(serializers.ModelSerializer):
    lawyer = UserSerializer(read_only=True)
    document_count = serializers.IntegerField(source='documents.count', read_only=True)
    
    class Meta:
        model = Case
        fields = [
            'id', 'title', 'description', 'priority', 'status',
            'lawyer', 'document_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'lawyer', 'created_at', 'updated_at']

