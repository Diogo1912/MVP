from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    ConversationViewSet, 
    MessageViewSet, 
    PromptViewSet, 
    KnowledgeBaseViewSet, 
    ChatView,
    RegenerateView,
    GenerateDocumentView
)

router = DefaultRouter()
router.register(r'conversations', ConversationViewSet, basename='conversation')
router.register(r'messages', MessageViewSet, basename='message')
router.register(r'prompts', PromptViewSet, basename='prompt')
router.register(r'knowledge-base', KnowledgeBaseViewSet, basename='knowledgebase')

urlpatterns = [
    path('ai/', include(router.urls)),
    path('ai/chat/', ChatView.as_view(), name='chat'),
    path('ai/regenerate/', RegenerateView.as_view(), name='regenerate'),
    path('ai/generate-document/', GenerateDocumentView.as_view(), name='generate-document'),
]
