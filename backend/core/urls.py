from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PublicationViewSet, DeleteRequestViewSet, ActivityLogViewSet

router = DefaultRouter()
router.register(r'publications', PublicationViewSet, basename='publication')
router.register(r'delete-requests', DeleteRequestViewSet, basename='deleterequest')
router.register(r'logs', ActivityLogViewSet, basename='activitylog')

urlpatterns = [
    path('', include(router.urls)),
]
