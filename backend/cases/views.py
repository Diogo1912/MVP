from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Case
from .serializers import CaseSerializer


class CaseViewSet(viewsets.ModelViewSet):
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.is_admin:
            return Case.objects.all()
        return Case.objects.filter(lawyer=user)
    
    def perform_create(self, serializer):
        serializer.save(lawyer=self.request.user)
