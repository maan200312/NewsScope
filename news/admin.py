from django.contrib import admin
from .models import Source, News, NewsCluster, SavedNews

@admin.register(Source)
class SourceAdmin(admin.ModelAdmin):
    list_display = ("name", "country", "language", "bias", "bias_score", "is_active", "created_at")
    search_fields = ("name",)
    list_filter = ("country", "language", "is_active")
    ordering = ("name",)

@admin.register(News)
class NewsAdmin(admin.ModelAdmin):
    list_display = ("title", "source", "cluster", "category", "country", "published_at", "is_active")
    search_fields = ("title", "content")
    list_filter = ("category", "country", "source", "is_active")
    autocomplete_fields = ("source", "cluster")
    ordering = ("-published_at",)

@admin.register(NewsCluster)
class NewsClusterAdmin(admin.ModelAdmin):
    list_display = ("main_title", "category", "bias", "bias_score", "article_count", "source_count", "created_at")
    search_fields = ("main_title",)
    list_filter = ("category", "bias")
    prepopulated_fields = {"slug": ("main_title",)}
    ordering = ("-created_at",)

@admin.register(SavedNews)
class SavedNewsAdmin(admin.ModelAdmin):
    list_display = ("user", "cluster", "article", "saved_at")
    list_filter = ("saved_at",)
    search_fields = ("user__email", "cluster__main_title")
    ordering = ("-saved_at",)