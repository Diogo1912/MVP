from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.http import HttpResponse
from django.utils import timezone
from datetime import timedelta
from .models import Document
from .serializers import DocumentSerializer, DocumentCreateSerializer
from analytics.models import AuditLog, UsageMetric
import os
from docx import Document as DocxDocument
from PyPDF2 import PdfReader
import io


class DocumentViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Document.objects.filter(user=self.request.user)
    
    def get_serializer_class(self):
        if self.action == 'create':
            return DocumentCreateSerializer
        return DocumentSerializer
    
    def perform_create(self, serializer):
        file = serializer.validated_data['file']
        document = serializer.save(
            user=self.request.user,
            original_filename=file.name,
            mime_type=file.content_type,
            file_size=file.size
        )
        
        # Extract text content
        try:
            file.seek(0)  # Reset file pointer
            if file.name.endswith('.pdf'):
                reader = PdfReader(file)
                text = '\n'.join([page.extract_text() for page in reader.pages if page.extract_text()])
                document.content_text = text
            elif file.name.endswith('.docx'):
                doc = DocxDocument(file)
                text = '\n'.join([para.text for para in doc.paragraphs if para.text.strip()])
                document.content_text = text
            file.seek(0)  # Reset again for storage
        except Exception as e:
            pass  # Handle errors silently for MVP
        
        document.save()
        
        # Track usage
        UsageMetric.objects.create(
            user=self.request.user,
            metric_type='document_uploaded',
            value=1,
            metadata={'document_id': document.id}
        )
        
        # Audit log
        AuditLog.objects.create(
            user=self.request.user,
            action='document_access',
            resource_type='document',
            resource_id=document.id
        )
    
    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Analyze document with AI"""
        document = self.get_object()
        if not document.content_text:
            return Response(
                {'error': 'Document has no extractable text'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        from ai_agent.services import AIService
        ai_service = AIService()
        
        try:
            result = ai_service.analyze_document(
                document.content_text,
                language=request.user.language
            )
            
            UsageMetric.objects.create(
                user=request.user,
                metric_type='document_analyzed',
                value=result['tokens_used'],
                metadata={'document_id': document.id}
            )
            
            return Response({'analysis': result['content']})
        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    @action(detail=True, methods=['get'])
    def download(self, request, pk=None):
        """Download document file"""
        document = self.get_object()
        
        AuditLog.objects.create(
            user=request.user,
            action='document_access',
            resource_type='document',
            resource_id=document.id,
            metadata={'action': 'download'}
        )
        
        response = HttpResponse(document.file.read(), content_type=document.mime_type)
        response['Content-Disposition'] = f'attachment; filename="{document.original_filename}"'
        return response
    
    @action(detail=True, methods=['post'])
    def export_to_docx(self, request, pk=None):
        """Export document content to DOCX format"""
        document = self.get_object()
        
        try:
            from docx import Document as DocxDocument
            from docx.shared import Inches
            
            doc = DocxDocument()
            doc.add_heading(document.title, 0)
            
            if document.content_text:
                for paragraph in document.content_text.split('\n'):
                    if paragraph.strip():
                        doc.add_paragraph(paragraph)
            
            # Save to memory
            buffer = io.BytesIO()
            doc.save(buffer)
            buffer.seek(0)
            
            AuditLog.objects.create(
                user=request.user,
                action='document_access',
                resource_type='document',
                resource_id=document.id,
                metadata={'action': 'export_docx'}
            )
            
            response = HttpResponse(buffer.read(), content_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document')
            response['Content-Disposition'] = f'attachment; filename="{document.title}.docx"'
            return response
        except Exception as e:
            return Response(
                {'error': f'Export failed: {str(e)}'},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def destroy(self, request, *args, **kwargs):
        document = self.get_object()
        
        # Audit log
        AuditLog.objects.create(
            user=request.user,
            action='document_delete',
            resource_type='document',
            resource_id=document.id
        )
        
        return super().destroy(request, *args, **kwargs)
