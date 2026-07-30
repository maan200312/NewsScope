from rest_framework import serializers
from .models import SavedNews
from news.models import News
from news.serializers import NewsSerializer


class SavedNewsSerializer(serializers.ModelSerializer):

    # POST ke liye
    news_id = serializers.PrimaryKeyRelatedField(
        queryset=News.objects.all(),
        source="news",
        write_only=True
    )

    # GET ke liye
    news = NewsSerializer(read_only=True)

    class Meta:
        model = SavedNews
        fields = [
            "id",
            "news",
            "news_id",
            "created_at",
        ]