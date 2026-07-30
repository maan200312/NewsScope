from django.urls import path
from .views import (
    register,
    login_view,
    logout,
    me,
    google_token,
    google_login,
    forgot_password,
    reset_password,
)

urlpatterns = [
    path("register/", register, name="register"),
    path("login/", login_view, name="login"),
    path("logout/", logout, name="logout"),
    path("me/", me, name="me"),
    path("forgot-password/", forgot_password, name="forgot-password"),
    path("reset-password/", reset_password, name="reset-password"),
    path("auth/google/token/", google_token, name="google-token"),
    path("auth/google/", google_login, name="google-login"),
]