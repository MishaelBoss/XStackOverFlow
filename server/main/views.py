from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth import authenticate, login, logout
from .serializers import *
from .models import *
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.views.decorators.csrf import csrf_exempt
from rest_framework import generics, permissions, status
from django.shortcuts import get_object_or_404


class RegisterAPI(APIView):
    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user = serializer.save()
                user_auth = authenticate(request, username=user.username, password=request.data['password'])
                if user_auth:
                    login(request, user_auth)
                    refresh = RefreshToken.for_user(user)
                    return Response({
                        'refresh': str(refresh),
                        'access': str(refresh.access_token),
                        'user': {
                            'username': user.username,
                            'email': user.email
                        }
                    }, status=status.HTTP_201_CREATED)
                return Response({'Ошибка': 'Авторизация неуспешная'}, status=status.HTTP_400_BAD_REQUEST)
            except Exception as e:
                return Response({'Ошибка': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPI(APIView):
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            user = authenticate(request, username=username, password=password)
            if user:
                login(request, user)
                refresh = RefreshToken.for_user(user)
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'username': user.username,
                        'email': user.email
                    }
                }, status=status.HTTP_200_OK)
            return Response({'Ошибка': 'Недействительные данные'}, status=status.HTTP_401_UNAUTHORIZED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@csrf_exempt
def logout(self, request):
    if request.user.is_authenticated:
        logout(request)
        return Response({'сообщение': 'Успешно вышел из системы'}, status=status.HTTP_200_OK)
    return Response({'Ошибка': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)


class LogoutAPI(APIView):
    def post(self, request):
        if request.user.is_authenticated:
            logout(request)
            return Response({'сообщение': 'Успешно вышел из системы'}, status=status.HTTP_200_OK)
        return Response({'Ошибка': 'Не авторизован'}, status=status.HTTP_401_UNAUTHORIZED)


class ProfileAPI(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self, request):
        UserProfile.objects.get_or_create(
            user=request.user,
            defaults={
                'name': '',
                'surname': '',
                'patronymic': '',
                'phone': '',
                'about': '',
                'years': '',
            }
        )
        serializer = UserSerializer(request.user)
        return Response(serializer.data, status=status.HTTP_200_OK)
    def put(self, request):
        user = request.user
        profile, created = UserProfile.objects.get_or_create(
            user=user,
            defaults={
                'name': '',
                'surname': '',
                'patronymic': '',
                'phone': '',
                'about': '',
                'years': '',
            }
        )
        user_data = {
            'username': request.data.get('username', user.username),
            'email': request.data.get('email', user.email),
        }
        user_serializer = UserSerializer(user, data=user_data, partial=True)
        if not user_serializer.is_valid():
            return Response(user_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        profile_serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        if not profile_serializer.is_valid():
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        password = request.data.get('password')
        if password:
            user.set_password(password)
        user_serializer.save()
        profile_serializer.save()
        user.save()
        return Response(
            {
                'user': user_serializer.data,
                'profile': profile_serializer.data,
            },
            status=status.HTTP_200_OK
        )


class ViewProfileAPI(APIView):
    def get(self, request, id):
        try:
            user = User.objects.get(id=id)
            profile = UserProfile.objects.get(user=user)
            data = {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'profile':{
                    'id': profile.id,
                    'name': profile.name,
                    'surname': profile.surname,
                    'patronymic': profile.patronymic,
                    'phone': profile.phone,
                    'about': profile.about,
                    'years': profile.years,
                    'image': request.build_absolute_uri(profile.image.url) if profile.image else None,
                }
            }
        except User.DoesNotExist:
            return Response({'Ошибка': 'Пользователь не найден'}, status=status.HTTP_404_NOT_FOUND)
        except UserProfile.DoesNotExist:
            return Response({'Ошибка': 'Профиля не найдено'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'Ошибка': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(data, status=status.HTTP_200_OK)


class PostAPI(APIView):
    def get(self, request, id):
        post = get_object_or_404(Post, id=id)
        user = User.objects.get(id=post.owner.id)
        profile = UserProfile.objects.get(user=user)
        data = {
            'id': post.id,
            'title': post.title,
            'information': post.information,
            'image': request.build_absolute_uri(post.image.url) if post.image else None,
            'category': post.category,
            'created_at': post.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            'isDecided': post.isDecided,
            'voice': post.voice,
            'owner': {
                'id': post.owner.id,
                'username': post.owner.username,
            },
            'profile':{
                'id': profile.id,
                'image': request.build_absolute_uri(profile.image.url) if profile.image else None,
            },
        }
        return Response(data, status=status.HTTP_200_OK)
    def post(self, request):
        serializer = PostSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            try:
                serializer.save()
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            except Exception as e:
                return Response({'Ошибка': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    def put(self, request, id):
        try:
            post = Post.objects.get(id=id)
            if not (post.owner == request.user):
                return Response({'error': 'У вас нет прав для редактирования этого поста'}, status=status.HTTP_403_FORBIDDEN)
            serializer = PostSerializer(post, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'Ошибка': 'Пост не найден'}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, request, id):
        try:
            post = Post.objects.get(id=id)
            if not (post.owner == request.user):
                return Response(
                    {'error': 'У вас нет прав для удаления этого поста'},
                    status=status.HTTP_403_FORBIDDEN
                )
            post.delete()
            return Response(
                {'message': 'Пост успешно удален'},
                status=status.HTTP_204_NO_CONTENT
            )
        except Post.DoesNotExist:
            return Response({'Ошибка': 'Пост не найден'}, status=status.HTTP_404_NOT_FOUND)


class PostListAPI(APIView):
    def get(self, request):
        try:
            post = Post.objects.all()
            serializer = PostSerializer(post, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'Ошибка': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        

class PostListUserAPI(APIView):
    def get(self, request, id):
        try:
            user = User.objects.get(id=id)
            posts = Post.objects.filter(owner=user).order_by('-created_at')
            serializer = PostSerializer(posts, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'Ошибка': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class MyPostAPI(APIView):
    def get(self, request):
        try:
            post = Post.objects.filter(owner=request.user)
            serializer = PostSerializer(post, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'Ошибка': str(e)}, status=status.HTTP_400_BAD_REQUEST)


class PostCommentsListCreateAPIView(generics.ListCreateAPIView):
    serializer_class = CommentSerializer
    permission_classes = (permissions.IsAuthenticatedOrReadOnly,)
    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        return Comment.objects.filter(post_id=post_id).order_by('-created_at')
    def perform_create(self, serializer):
        post_id = self.kwargs.get('post_id')
        post = get_object_or_404(Post, pk=post_id)
        serializer.save(post=post, owner=self.request.user)
    def put(self, request, post_id):
        try:
            post_id = self.kwargs.get('post_id')
            post = get_object_or_404(Post, pk=post_id)
            comment = Comment.objects.get(post=post_id)
            if not (comment.owner == request.user):
                return Response({'error': 'У вас нет прав для редактирования этой пост'},status=status.HTTP_403_FORBIDDEN)
            serializer = PostSerializer(comment, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data, status=status.HTTP_200_OK)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        except Post.DoesNotExist:
            return Response({'error': 'Пост не найден'}, status=status.HTTP_404_NOT_FOUND)
    def delete(self, serializer, post_id):
        try:
            post = get_object_or_404(Post, pk=post_id)
            comment = Comment.objects.get(post=post_id)
            if not (comment.owner == serializer.user):
                return Response({'error': 'У вас нет прав для удаления этого коммента'},status=status.HTTP_403_FORBIDDEN)
            comment.delete()
            return Response({'message': 'Коммент успешно удален'},status=status.HTTP_204_NO_CONTENT)
        except Post.DoesNotExist:
            return Response({'error': 'Коммент не найден'}, status=status.HTTP_404_NOT_FOUND)