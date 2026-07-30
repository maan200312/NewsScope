from rest_framework import generics, permissions
from .models import SavedNews
from .serializers import SavedNewsSerializer


class SavedNewsCreateView(generics.ListCreateAPIView):

    serializer_class = SavedNewsSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return SavedNews.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)