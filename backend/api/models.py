from django.contrib.auth.models import AbstractUser
from django.db import models

class User(AbstractUser):
    ROLE_CHOICES = (
        ('ADMIN', 'Администратор'),
        ('METHODIST', 'Методист'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='METHODIST')

class Work(models.Model):
    STATUS_CHOICES = (
        ('PENDING', 'На модерации'),
        ('APPROVED', 'Одобрено'),
        ('REJECTED', 'Отклонено'),
    )
    
    title = models.CharField(max_length=200)
    description = models.TextField()
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name='works')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='PENDING')
    rejection_reason = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    file = models.FileField(upload_to='works/', blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} ({self.get_status_display()})"
