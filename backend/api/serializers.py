from rest_framework import serializers
from .models import User, Work

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'role']

class WorkSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Work
        fields = [
            'id', 'title', 'description', 'author', 'author_name',
            'status', 'status_display', 'rejection_reason',
            'created_at', 'updated_at', 'file'
        ]
        read_only_fields = ['author', 'status', 'rejection_reason', 'created_at', 'updated_at']

class WorkAdminSerializer(serializers.ModelSerializer):
    author_name = serializers.CharField(source='author.username', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Work
        fields = [
            'id', 'title', 'description', 'author', 'author_name',
            'status', 'status_display', 'rejection_reason',
            'created_at', 'updated_at', 'file'
        ]
        read_only_fields = ['author', 'created_at', 'updated_at']
