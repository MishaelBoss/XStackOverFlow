from rest_framework import serializers
from django.contrib.auth.models import User
from .models import *


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['name', 'surname', 'patronymic', 'phone', 'about', 'years', 'image']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(source='userprofile', read_only=True)
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'profile']
    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if not representation.get('profile'):
            representation['profile'] = {
                'name': '',
                'surname': '',
                'patronymic': '',
                'phone': '',
                'about': '',
                'years': '',
                'image': None,
            }
        return representation


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    name = serializers.CharField(required=False, allow_blank=True)
    surname = serializers.CharField(required=False, allow_blank=True)
    patronymic = serializers.CharField(required=False, allow_blank=True)
    phone = serializers.CharField(required=False, allow_blank=True)
    about = serializers.CharField(required=False, allow_blank=True)
    years = serializers.CharField(required=False, allow_blank=True)
    image = serializers.ImageField(required=False)
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'name', 'surname', 'patronymic', 'phone', 'about', 'years', 'image']
    def create(self, validated_data):
        profile_data = {
            'name': validated_data.pop('name', ''),
            'surname': validated_data.pop('surname', ''),
            'patronymic': validated_data.pop('patronymic', ''),
            'phone': validated_data.pop('phone', ''),
            'about': validated_data.pop('about', ''),
            'years': validated_data.pop('years', ''),
            'image': validated_data.pop('image', None),
        }
        try:
            user = User.objects.create_user(
                username=validated_data['username'],
                email=validated_data['email'],
                password=validated_data['password'],
            )
            profile = UserProfile.objects.create(
                user=user,
                **profile_data
            )
            return user
        except Exception as e:
            raise


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)
    

class PostSerializer(serializers.ModelSerializer):
    class Meta:
        model = Post
        fields = [
            'id', 'title', 'information', 'image', 'category', 'created_at', 'isDecided', 'voice', 'owner'
        ]
        read_only_fields = ('id', 'created_at', 'image', 'owner')
    def validate(self, attrs):
        ctx = getattr(self, 'context', {}) or {}
        request = ctx.get('request')
        if not request or not getattr(request, 'user', None) or not request.user.is_authenticated:
            raise serializers.ValidationError("Требуется авторизация")
        if self.instance and getattr(self.instance, 'owner', None) != request.user:
            raise serializers.ValidationError("Вы не являетесь владельцем этого поста")
        return attrs
    def normalize_choices(self, validated_data, fields):
        if isinstance(fields, str):
            fields = [fields]
        for field in fields:
            value = validated_data.get(field)
            if value is None:
                continue
            choices = getattr(Post, f'{field.upper()}_CHOICES', None)
            if not choices:
                continue
            label_to_value = {str(label): value for value, label in choices}
            if str(value) in label_to_value:
                validated_data[field] = label_to_value[str(value)]
            else:
                try:
                    first_value = next(iter(choices))[0]
                    if isinstance(first_value, int):
                        validated_data[field] = int(value)
                except Exception:
                    pass
    def create(self, validated_data):
        request = self.context.get('request')
        owner = request.user
        validated_data['owner'] = owner
        self.normalize_choices(validated_data, ['category'])
        return super().create(validated_data)
    def update(self, instance, validated_data):
        self.normalize_choices(validated_data, ['category'])
        return super().update(instance, validated_data)
    

class CommentSerializer(serializers.ModelSerializer):
    owner = serializers.StringRelatedField(read_only=True)
    post = serializers.PrimaryKeyRelatedField(read_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'post', 'content', 'created_at', 'updated_at', 'owner', 'owner_id']
        read_only_fields = ['id', 'created_at', 'updated_at', 'post', 'owner', 'owner_id']
        extra_kwargs = {
            'content': {
                'error_messages': {
                    'blank': 'Comment content cannot be empty',
                    'required': 'Comment content is required'
                }
            }
        }
    def create(self, validated_data):
        request = self.context.get('request')
        validated_data['owner'] = request.user
        if len(validated_data.get('content', '').strip()) < 5:
            raise serializers.ValidationError({
                'content': 'Comment must be at least 5 characters long'
            })   
        return super().create(validated_data)

class CreateCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comment
        fields = ['content']
    def validate_content(self, value):
        if not value.strip():
            raise serializers.ValidationError('Комментарий не может быть пустым')
        if not len(value) < 5:
            raise serializers.ValidationError('Комментарий слишком короткий')
        if len(value) > 2000:
            raise serializers.ValidationError('Комментарий слишком длинный')
        return value