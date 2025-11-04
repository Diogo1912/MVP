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
        ('other', _('Other')),
    ]
    
    title = models.CharField(max_length=255)
    file = models.FileField(upload_to=document_upload_path)
    file_type = models.CharField(max_length=20, choices=DOCUMENT_TYPE_CHOICES, default='other')
    original_filename = models.CharField(max_length=255)
    mime_type = models.CharField(max_length=100)
    file_size = models.PositiveIntegerField()  # in bytes
    case = models.ForeignKey(Case, on_delete=models.SET_NULL, null=True, blank=True, related_name='documents')
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents')
    content_text = models.TextField(blank=True)  # Extracted text content
    is_encrypted = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = _('document')
        verbose_name_plural = _('documents')
    
    def __str__(self):
        return self.title
    
    def delete(self, *args, **kwargs):
        """Delete file when document is deleted"""
        if self.file:
            if os.path.isfile(self.file.path):
                os.remove(self.file.path)
        super().delete(*args, **kwargs)
