from django.urls import path
from .views import *
from . import views

urlpatterns = [
    path('register/', RegisterAPI.as_view(), name='register'),
    path('login/', LoginAPI.as_view(), name='login'),
    path('logout/', views.logout, name='logout'),
    path('api/profile/', ProfileAPI.as_view(), name='profile'),
    path('api/profile/view/<int:id>', ViewProfileAPI.as_view(), name='profile-view'),
    path('api/post/add/', PostAPI.as_view(), name='post_add'),
    path('api/post/<int:id>/', PostAPI.as_view(), name='post_detail'),
    path('api/posts/', PostListAPI.as_view(), name='all_posts_list'),
    path('api/my/posts/', MyPostAPI.as_view(), name='my_posts_list'),
    path('api/posts/<int:post_id>/comments/', PostCommentsListCreateAPIView.as_view(), name='post-comments'),
]