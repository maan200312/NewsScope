from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model, authenticate
from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.core.mail import send_mail
from django.conf import settings
import requests

User = get_user_model()

# ---------- REGISTER ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '').strip()
    name = request.data.get('name', '').strip()

    if not email or not password:
        return Response({'error': 'Email and password required'}, status=400)
    if len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': 'User already exists with this email'}, status=400)

    user = User.objects.create_user(username=email, email=email, password=password)
    if name:
        user.first_name = name
        user.save()

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'id': user.id,
        'email': user.email,
        'name': name or email.split('@')[0]
    }, status=201)

# ---------- LOGIN ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email', '').strip().lower()
    password = request.data.get('password', '').strip()

    if not email or not password:
        return Response({'error': 'Email and password required'}, status=400)

    user = authenticate(username=email, password=password)
    if not user:
        return Response({'error': 'Invalid email or password'}, status=400)

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'id': user.id,
        'email': user.email,
        'name': user.first_name or user.email.split('@')[0]
    })

# ---------- LOGOUT ----------
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):
    try:
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return Response({'error': 'Refresh token required'}, status=400)
        token = RefreshToken(refresh_token)
        token.blacklist()
        return Response({'message': 'Logged out successfully'})
    except Exception:
        return Response({'error': 'Invalid or expired token'}, status=400)

# ---------- FORGOT PASSWORD ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def forgot_password(request):
    email = request.data.get('email', '').strip().lower()
    if not email:
        return Response({'error': 'Email required'}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        # Security: same message even if user not exists
        return Response({'message': 'If account exists, reset link sent'})

    uid = urlsafe_base64_encode(force_bytes(user.pk))
    token = default_token_generator.make_token(user)
    reset_link = f"{settings.FRONTEND_URL}/reset-password/{uid}/{token}/"

    # Email send
    send_mail(
        subject="Reset your password",
        message=f"Click to reset your password: {reset_link}\nThis link is valid for 1 hour.",
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False,
    )
    print(f"RESET LINK FOR {email}: {reset_link}")

    return Response({
        'message': 'If account exists, reset link sent',
        'debug_link': reset_link  # production pe hata dena
    })

# ---------- RESET PASSWORD ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def reset_password(request):
    uidb64 = request.data.get('uid')
    token = request.data.get('token')
    new_password = request.data.get('password', '').strip()

    if not uidb64 or not token or not new_password:
        return Response({'error': 'uid, token and password required'}, status=400)
    if len(new_password) < 6:
        return Response({'error': 'Password must be at least 6 characters'}, status=400)

    try:
        uid = force_str(urlsafe_base64_decode(uidb64))
        user = User.objects.get(pk=uid)
    except Exception:
        return Response({'error': 'Invalid link'}, status=400)

    if not default_token_generator.check_token(user, token):
        return Response({'error': 'Link expired or invalid'}, status=400)

    user.set_password(new_password)
    user.save()
    return Response({'message': 'Password reset successful, please login'})

# ---------- ME ----------
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    user = request.user
    return Response({
        'id': user.id,
        'email': user.email,
        'name': user.first_name or user.email.split('@')[0]
    })

# ---------- GOOGLE - Session to JWT (for django-allauth flow) ----------
@api_view(['GET'])
@permission_classes([AllowAny])
def google_token(request):
    if not request.user.is_authenticated:
        return Response({'error': 'Not authenticated with Google'}, status=401)

    user = request.user
    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'email': user.email,
        'id': user.id,
        'name': user.first_name or user.username or user.email.split('@')[0]
    })

# ---------- GOOGLE - Direct ID Token (React frontend flow) ----------
@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    id_token_str = request.data.get('id_token')
    if not id_token_str:
        return Response({'error': 'id_token required'}, status=400)

    try:
        resp = requests.get(f"https://oauth2.googleapis.com/tokeninfo?id_token={id_token_str}", timeout=10)
        data = resp.json()
        if 'email' not in data:
            return Response({'error': 'Invalid Google token', 'details': data}, status=400)
        email = data['email'].lower()
        name = data.get('name', '') or data.get('given_name', '')
    except Exception as e:
        return Response({'error': f'Google verification failed: {e}'}, status=400)

    try:
        user = User.objects.get(email__iexact=email)
        created = False
        if name and not user.first_name:
            user.first_name = name
            user.save()
    except User.DoesNotExist:
        user = User.objects.create_user(username=email, email=email, first_name=name)
        user.set_unusable_password()
        user.save()
        created = True

    refresh = RefreshToken.for_user(user)
    return Response({
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'id': user.id,
        'email': user.email,
        'name': user.first_name or email.split('@')[0],
        'is_new_user': created
    })