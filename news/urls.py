from django.urls import path
from .views import (
    NewsListView,
    ClusterListView,
    ClusterDetailView,
    TopStoriesView,
    LatestStoriesView,
    LocalStoriesView,
    ForYouView,
    BlindspotListView,
    saved_news_view
)

urlpatterns = [
    path("news/", NewsListView.as_view(), name="news-list"),
    path("clusters/", ClusterListView.as_view(), name="cluster-list"),
    path("clusters/top/", TopStoriesView.as_view(), name="top-stories"),
    path("clusters/latest/", LatestStoriesView.as_view(), name="latest-stories"),
    path("clusters/local/", LocalStoriesView.as_view(), name="local-stories"),
    path("clusters/for-you/", ForYouView.as_view(), name="for-you"),
    path("clusters/blindspot/", BlindspotListView.as_view(), name="blindspot"),
    path("clusters/<slug:slug>/", ClusterDetailView.as_view(), name="cluster-detail"),
    
    # ✅ NEW - Saved Stories API (ye 2 lines add karni hain)
    path("saved/", saved_news_view, name="saved-news"),
]