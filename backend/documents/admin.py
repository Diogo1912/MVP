from django.contrib import admin
from .models import Document


@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'user', 'file_type', 'case', 'file_size', 'created_at']
    list_filter = ['file_type', 'is_encrypted', 'created_at']
    search_fields = ['title', 'original_filename']
    readonly_fields = ['created_at', 'updated_at', 'file_size']
