from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import User, Work
from .serializers import UserSerializer, WorkSerializer, WorkAdminSerializer

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        if response.status_code == 200:
            user = User.objects.get(username=request.data['username'])
            response.data['user'] = UserSerializer(user).data
        return response

class UserMeView(viewsets.ReadOnlyModelViewSet):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class WorkViewSet(viewsets.ModelViewSet):
    serializer_class = WorkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role == 'ADMIN':
            return Work.objects.all()
        return Work.objects.filter(author=user)
    
    def perform_create(self, serializer):
        serializer.save(author=self.request.user, status='PENDING')

class WorkAdminViewSet(viewsets.ModelViewSet):
    serializer_class = WorkAdminSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        if self.request.user.role != 'ADMIN':
            return Work.objects.none()
        
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            return Work.objects.filter(status=status_filter)
        return Work.objects.all()
    
    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        work = self.get_object()
        work.status = 'APPROVED'
        work.rejection_reason = None
        work.save()
        return Response({'status': 'approved'})
    
    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        work = self.get_object()
        work.status = 'REJECTED'
        work.rejection_reason = request.data.get('reason', '')
        work.save()
        return Response({'status': 'rejected'})
