from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomTokenObtainPairView, UserMeView, WorkViewSet, WorkAdminViewSet
from rest_framework_simplejwt.views import TokenRefreshView

router = DefaultRouter()
router.register(r'works', WorkViewSet)
router.register(r'admin/works', WorkAdminViewSet)
router.register(r'user', UserMeView, basename='user')

urlpatterns = [
    path('login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('me/', UserMeView.as_view({'get': 'me'}), name='user_me'),
    path('', include(router.urls)),
]
