from rest_framework import serializers
from .models import Conversation, Message, Prompt, KnowledgeBase
from documents.serializers import DocumentSerializer


class MessageSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'conversation', 'role', 'content', 'document', 'tokens_used', 'created_at']
        read_only_fields = ['id', 'created_at']


class ConversationSerializer(serializers.ModelSerializer):
    messages = MessageSerializer(many=True, read_only=True)
    message_count = serializers.IntegerField(source='messages.count', read_only=True)
    
    class Meta:
        model = Conversation
        fields = ['id', 'user', 'case', 'title', 'language', 'messages', 'message_count', 'created_at', 'updated_at']
        read_only_fields = ['id', 'user', 'created_at', 'updated_at']


class PromptSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prompt
        fields = ['id', 'name', 'description', 'prompt_text', 'version', 'is_active', 'language', 'created_at']
        read_only_fields = ['id', 'created_at']


class KnowledgeBaseSerializer(serializers.ModelSerializer):
    document = DocumentSerializer(read_only=True)
    
    class Meta:
        model = KnowledgeBase
        fields = ['id', 'name', 'description', 'document', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

