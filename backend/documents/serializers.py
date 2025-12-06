from rest_framework import serializers
from .models import Document


class DocumentSerializer(serializers.ModelSerializer):
    case_title = serializers.CharField(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_type', 'original_filename',
            'mime_type', 'file_size', 'case', 'case_title', 'user', 
            'content_text', 'analysis', 'is_encrypted', 'is_ai_generated',
            'priority', 'status', 'tags',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'file_size', 'case_title', 'created_at', 'updated_at']


class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'file', 'file_type', 'case', 'priority', 'status', 'tags']


class DocumentUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'file_type', 'case', 'priority', 'status', 'tags']
