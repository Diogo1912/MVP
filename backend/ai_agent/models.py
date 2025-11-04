from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from documents.models import Document


class Prompt(models.Model):
    """AI Prompt templates with versioning"""
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    prompt_text = models.TextField()
    version = models.PositiveIntegerField(default=1)
    is_active = models.BooleanField(default=True)
    language = models.CharField(max_length=2, choices=[('en', 'English'), ('pl', 'Polish')], default='pl')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-version', '-created_at']
        unique_together = ['name', 'version']
        verbose_name = _('prompt')
        verbose_name_plural = _('prompts')
    
    def __str__(self):
        return f"{self.name} v{self.version}"


class Conversation(models.Model):
    """AI Conversation history"""
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='conversations')
    title = models.CharField(max_length=255, blank=True)
    language = models.CharField(max_length=2, choices=[('en', 'English'), ('pl', 'Polish')], default='pl')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-updated_at']
        verbose_name = _('conversation')
        verbose_name_plural = _('conversations')
    
    def __str__(self):
        return f"Conversation {self.id} - {self.user.email}"


class Message(models.Model):
    """Individual messages in a conversation"""
    
    ROLE_CHOICES = [
        ('user', _('User')),
        ('assistant', _('Assistant')),
        ('system', _('System')),
    ]
    
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name='messages')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES)
    content = models.TextField()
    document = models.ForeignKey(Document, on_delete=models.SET_NULL, null=True, blank=True, related_name='messages')
    tokens_used = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        verbose_name = _('message')
        verbose_name_plural = _('messages')
    
    def __str__(self):
        return f"{self.role}: {self.content[:50]}..."


class KnowledgeBase(models.Model):
    """Knowledge base documents for AI context"""
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    document = models.ForeignKey(Document, on_delete=models.CASCADE, related_name='knowledge_base_entries')
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('knowledge base entry')
        verbose_name_plural = _('knowledge base entries')
    
    def __str__(self):
        return self.name
