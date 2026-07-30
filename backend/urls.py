from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Google callback ke liye lazmi hai
    path('accounts/', include('allauth.urls')),

    # Ye line missing thi - is se hi register/login chalega
    path('api/', include('users.urls')),

    # Baqi apps
    path('api/', include('news.urls')),
    path('api/', include('api.urls')),
]