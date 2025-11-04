from rest_framework import serializers
from .models import Document
from cases.serializers import CaseSerializer


class DocumentSerializer(serializers.ModelSerializer):
    case = CaseSerializer(read_only=True)
    
    class Meta:
        model = Document
        fields = [
            'id', 'title', 'file', 'file_type', 'original_filename',
            'mime_type', 'file_size', 'case', 'user', 'content_text',
            'is_encrypted', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'user', 'file_size', 'created_at', 'updated_at']


class DocumentCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['title', 'file', 'file_type', 'case']

