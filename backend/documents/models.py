from django.db import models
from django.utils.translation import gettext_lazy as _
from accounts.models import User
from cases.models import Case
import os


def document_upload_path(instance, filename):
    """Generate upload path for documents"""
    return f'documents/{instance.user.id}/{filename}'


class Document(models.Model):
    """Document model for legal documents"""
    
    DOCUMENT_TYPE_CHOICES = [
        ('pleading', _('Pleading')),
        ('opinion', _('Opinion')),
        ('contract', _('Contract')),
        ('ai_generated', _('AI Generated')),
        ('other', _('Other')),
    ]
    
    PRIORITY_CHOICES = [
        ('low', _('Low')),
        ('medium', _('Medium')),
        ('urgent', _('Urgent')),
    ]
    
    STATUS_CHOICES = [
        ('started', _('Started')),
        ('in-progress', _('In Progress')),
        ('done', _('Done')),
    ]
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=document_upload_path, blank=True, null=True)
    file_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='other')
    original_filename = models.CharField(max_length=255, blank=True)
    mime_type = models.CharField(max_length=100, blank=True)
    file_size = models.PositiveIntegerField(default=0)  # in bytes
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    content_text = models.TextField(blank=True)  # Extracted text content
    analysis = models.TextField(blank=True)  # AI analysis result
    is_encrypted = models.BooleanField(default=False)
    is_ai_generated = models.BooleanField(default=False)
    
    # New fields for priority, status, and tags
    priority = models.CharField(max_length=10, choices=PRIORITY_CHOICES, default='medium')
    status = models.CharField(max_length=15, choices=STATUS_CHOICES, default='started')
    tags = models.JSONField(default=list, blank=True)  # Store tags as JSON array
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('document')
        verbose_name_plural = _('documents')
    
    def __str__(self):
        return self.title
    
    @property
    def case_title(self):
        """Get the case title if assigned"""
        return self.case.title if self.case else None
    
    def delete(self, *args, **kwargs):
        """Delete file when document is deleted"""
        if self.file:
            try:
                if os.path.isfile(self.file.path):
                    os.remove(self.file.path)
            except (ValueError, FileNotFoundError):
                pass
        super().delete(*args, **kwargs)
