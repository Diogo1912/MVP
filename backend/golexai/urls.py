"""
URL configuration for golexai project.
"""

from django.contrib import admin
from django.urls import path, include, re_path
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic import TemplateView
from django.http import HttpResponse
import os

def serve_frontend(request, path=''):
    """Serve the frontend files"""
    frontend_dir = settings.BASE_DIR.parent / 'frontend'
    
    if not path or path == '/':
        file_path = frontend_dir / 'index.html'
    else:
        file_path = frontend_dir / path
    
    # Security: prevent directory traversal
    try:
        file_path = file_path.resolve()
        if not str(file_path).startswith(str(frontend_dir.resolve())):
            return HttpResponse('Forbidden', status=403)
    except:
        return HttpResponse('Not Found', status=404)
    
    if file_path.is_file():
        content_type = 'text/html'
        if path.endswith('.css'):
            content_type = 'text/css'
        elif path.endswith('.js'):
            content_type = 'application/javascript'
        elif path.endswith('.json'):
            content_type = 'application/json'
        elif path.endswith('.png'):
            content_type = 'image/png'
        elif path.endswith('.jpg') or path.endswith('.jpeg'):
            content_type = 'image/jpeg'
        elif path.endswith('.svg'):
            content_type = 'image/svg+xml'
        elif path.endswith('.ico'):
            content_type = 'image/x-icon'
        elif path.endswith('.woff'):
            content_type = 'font/woff'
        elif path.endswith('.woff2'):
            content_type = 'font/woff2'
        
        with open(file_path, 'rb') as f:
            return HttpResponse(f.read(), content_type=content_type)
    
    # If file not found, serve index.html for SPA routing
    index_path = frontend_dir / 'index.html'
    if index_path.is_file():
        with open(index_path, 'rb') as f:
            return HttpResponse(f.read(), content_type='text/html')
    
    return HttpResponse('Not Found', status=404)


urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/auth/", include("accounts.urls")),
    path("api/", include("documents.urls")),
    path("api/", include("cases.urls")),
    path("api/", include("ai_agent.urls")),
    path("api/", include("analytics.urls")),
    
    # Serve frontend - catch all non-API routes
    path('', serve_frontend, name='frontend_root'),
    re_path(r'^(?!api/)(?!admin/)(?P<path>.*)$', serve_frontend, name='frontend'),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
