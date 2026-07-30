from rest_framework import generics
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from .models import News, NewsCluster, SavedNews
from .serializers import NewsSerializer, NewsClusterSerializer, NewsClusterDetailSerializer, SavedNewsSerializer

# =====================================================
# NEWS
# =====================================================
class NewsListView(generics.ListAPIView):
    serializer_class = NewsSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return News.objects.filter(is_active=True).order_by('-published_at')

# =====================================================
# CLUSTERS
# =====================================================
class ClusterListView(generics.ListAPIView):
    serializer_class = NewsClusterSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        qs = NewsCluster.objects.all().order_by('-latest_published')
        category = self.request.query_params.get('category')
        if category:
            qs = qs.filter(category=category)
        return qs

class ClusterDetailView(generics.RetrieveAPIView):
    serializer_class = NewsClusterDetailSerializer
    permission_classes = [AllowAny]
    lookup_field = 'slug'
    queryset = NewsCluster.objects.all()

class TopStoriesView(generics.ListAPIView):
    serializer_class = NewsClusterSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return NewsCluster.objects.filter(is_top_story=True).order_by('-latest_published')[:20]

class LatestStoriesView(generics.ListAPIView):
    serializer_class = NewsClusterSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        return NewsCluster.objects.all().order_by('-latest_published')[:20]

class LocalStoriesView(generics.ListAPIView):
    serializer_class = NewsClusterSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        # Pakistan local
        return NewsCluster.objects.filter(country='pk').order_by('-latest_published')[:20]

class ForYouView(generics.ListAPIView):
    serializer_class = NewsClusterSerializer
    permission_classes = [IsAuthenticated]
    def get_queryset(self):
        # For now return all, frontend will filter by categories
        # Later you can filter by user preferences
        return NewsCluster.objects.all().order_by('-latest_published')[:50]

class BlindspotListView(generics.ListAPIView):
    serializer_class = NewsClusterSerializer
    permission_classes = [AllowAny]
    def get_queryset(self):
        # Blindspot = only left or only right coverage
        from django.db.models import Q
        return NewsCluster.objects.filter(Q(left_sources=0) | Q(right_sources=0)).order_by('-latest_published')

# =====================================================
# ✅ SAVED NEWS API - 3 in 1 (GET, POST, DELETE)
# =====================================================
@api_view(['GET', 'POST', 'DELETE'])
@permission_classes([IsAuthenticated])
def saved_news_view(request):
    # GET - list all saved
    if request.method == 'GET':
        saved = SavedNews.objects.filter(user=request.user).select_related('cluster', 'article')
        serializer = SavedNewsSerializer(saved, many=True, context={'request': request})
        return Response(serializer.data)

    # POST - save a cluster or article
    if request.method == 'POST':
        cluster_id = request.data.get('cluster_id')
        article_id = request.data.get('article_id')

        if not cluster_id:
            return Response({'error': 'cluster_id required'}, status=400)

        try:
            cluster = NewsCluster.objects.get(id=cluster_id)
        except NewsCluster.DoesNotExist:
            return Response({'error': 'Cluster not found'}, status=404)

        article = None
        if article_id:
            try:
                article = News.objects.get(id=article_id)
            except News.DoesNotExist:
                article = None

        saved, created = SavedNews.objects.get_or_create(
            user=request.user,
            cluster=cluster,
            article=article
        )

        if not created:
            return Response({'message': 'Already saved', 'id': saved.id}, status=200)

        serializer = SavedNewsSerializer(saved, context={'request': request})
        return Response(serializer.data, status=201)

    # DELETE - unsave
    if request.method == 'DELETE':
        # support both body and query params
        cluster_id = request.data.get('cluster_id') if hasattr(request, 'data') else None
        article_id = request.data.get('article_id') if hasattr(request, 'data') else None
        
        if not cluster_id:
            cluster_id = request.query_params.get('cluster_id')
        if not article_id:
            article_id = request.query_params.get('article_id')

        filters = {'user': request.user}
        if cluster_id:
            filters['cluster_id'] = cluster_id
        if article_id:
            filters['article_id'] = article_id

        deleted, _ = SavedNews.objects.filter(**filters).delete()
        if deleted:
            return Response({'message': 'Unsaved successfully'})
        return Response({'error': 'Not found in saved'}, status=404)