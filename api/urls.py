from django.urls import path
from .views import SavedNewsCreateView

urlpatterns = [

    path(
        "saved/",
        SavedNewsCreateView.as_view(),
        name="saved-news"
    ),

]