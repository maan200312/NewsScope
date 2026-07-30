from rest_framework import serializers
from .models import News, NewsCluster, SavedNews

# =====================================================
# NEWS SERIALIZER
# =====================================================
class NewsSerializer(serializers.ModelSerializer):
    source_name = serializers.CharField(source="source.name", read_only=True)
    source_country = serializers.CharField(source="source.country", read_only=True)
    source_language = serializers.CharField(source="source.language", read_only=True)
    source_bias = serializers.CharField(source="source.bias", read_only=True)
    cluster_title = serializers.CharField(source="cluster.main_title", read_only=True)
    cluster_slug = serializers.CharField(source="cluster.slug", read_only=True)
    cluster_bias = serializers.CharField(source="cluster.bias", read_only=True)
    cluster_bias_score = serializers.IntegerField(source="cluster.bias_score", read_only=True)
    cluster_article_count = serializers.IntegerField(source="cluster.article_count", read_only=True)
    cluster_source_count = serializers.IntegerField(source="cluster.source_count", read_only=True)
    source_logo = serializers.CharField(source="source.logo", read_only=True)

    class Meta:
        model = News
        fields = [
            "id","title","content","image_url","url","published_at",
            "category","country","language","bias","bias_score",
            "source_name","source_country","source_language","source_bias","source_logo",
            "cluster_title","cluster_slug","cluster_bias","cluster_bias_score",
            "cluster_article_count","cluster_source_count",
        ]

# =====================================================
# CLUSTER LIST SERIALIZER
# =====================================================
class NewsClusterSerializer(serializers.ModelSerializer):
    hero_image = serializers.SerializerMethodField()
    blindspot_type = serializers.SerializerMethodField()
    is_saved = serializers.SerializerMethodField()

    class Meta:
        model = NewsCluster
        fields = [
            "id","main_title","slug","hero_image","category","country","language",
            "bias","bias_score","article_count","source_count",
            "left_sources","center_sources","right_sources",
            "hero_source","latest_published","is_top_story","blindspot_type","is_saved"
        ]

    def get_hero_image(self, obj):
        if obj.image_url:
            return obj.image_url
        article = obj.articles.first()
        if article:
            return article.image_url
        return ""

    def get_blindspot_type(self, obj):
        if obj.left_sources > 0 and obj.right_sources == 0:
            return "left"
        if obj.right_sources > 0 and obj.left_sources == 0:
            return "right"
        return None

    def get_is_saved(self, obj):
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return SavedNews.objects.filter(user=request.user, cluster=obj).exists()
        return False

# =====================================================
# CLUSTER DETAIL SERIALIZER
# =====================================================
class NewsClusterDetailSerializer(serializers.ModelSerializer):
    articles = NewsSerializer(many=True, read_only=True)
    hero_image = serializers.SerializerMethodField()

    class Meta:
        model = NewsCluster
        fields = [
            "id","main_title","slug","hero_image","image_url",
            "category","country","language","bias","bias_score",
            "article_count","source_count","left_sources","center_sources",
            "right_sources","hero_source","latest_published","is_top_story","articles",
        ]

    def get_hero_image(self, obj):
        if obj.image_url:
            return obj.image_url
        article = obj.articles.first()
        if article:
            return article.image_url
        return ""

# =====================================================
# SAVED NEWS SERIALIZER
# =====================================================
class SavedNewsSerializer(serializers.ModelSerializer):
    cluster_detail = NewsClusterSerializer(source="cluster", read_only=True)
    article_detail = NewsSerializer(source="article", read_only=True)

    class Meta:
        model = SavedNews
        fields = ["id", "cluster", "article", "saved_at", "cluster_detail", "article_detail"]
        read_only_fields = ["id", "saved_at"]