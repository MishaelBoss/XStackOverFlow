from django.db import models
from django.contrib.auth.models import User
    
class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='userprofile')
    name = models.CharField(max_length=100, null=True, blank=True)
    surname = models.CharField(max_length=100, null=True, blank=True)
    patronymic = models.CharField(max_length=100, null=True, blank=True)
    phone = models.TextField(blank=True)
    about = models.TextField(blank=True)
    years = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='user/', blank=True, null=True)

    def __str__(self):
        return f'UserProfile {self.user.username} ({self.id})'


class Post(models.Model):
    title = models.CharField(max_length=100, null=False)
    information = models.TextField(max_length=500, blank=True)
    image = models.ImageField(upload_to='post_images/', blank=True, null=True)
    CATEGORY_CHOICES = [
        ('1', 'ПО'),
        ('2', 'Срочно'),
        ('3', 'Остальное'),
    ]
    category = models.CharField(max_length=1, choices=CATEGORY_CHOICES, default='1')
    date_crete = models.DateTimeField(auto_now_add=True)
    isDecided = models.BooleanField(blank=True, null=False, default=False)
    voice = models.IntegerField(blank=True, default=0)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owner_post')

    class Meta:
        ordering = ['-date_crete']

    def __str__(self):
        return f'Post {self.title} ({self.id})'
    

class Comment(models.Model):
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='owner')
    post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='post')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f'Comment {self.id} by {self.id}'