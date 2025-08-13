'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import Image from 'next/image';
import CheckImage from '@/public/check.png'
import ImageUser from '@/public/default-avatar.png'
import { PAGES } from '@/app/config/page.config';
import { CartComment } from '@/app/components/shared/cart_comment';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Post } from '@/app/shared/types/post.interface';
import { Comment } from '@/app/shared/types/comment.interface';

type Props = {
  params: Promise<{ id: string }>
}

export default function PostView({ params }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [comment, setComment] = useState<Pick<Comment, 'content'>>({
    content: ''
  });
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setComment({ 
      ...comment, 
      [e.target.name]: e.target.value 
    });
  };

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const id = (await params).id;
        const res = await fetch(`http://localhost:8000/api/post/${id}/`);

        if (res.ok) {
          const data = await res.json();
          setPost(data);
        }else{
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось загрузить пост или ее нету.`);
        }

        const resComments = await fetch(`http://localhost:8000/api/posts/${id}/comments/`);

        if (resComments.ok) {
          const dataComments: Comment[] = await resComments.json();
          setComments(dataComments);
        } else {
          console.warn('Не удалось загрузить комментарии', resComments.status);
        }
      } catch (err: any) {
        throw new Error(err);
      }
    };
    fetchPost();
  }, [router, params]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = (await params).id;
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }
      
      const res = await fetch(`http://localhost:8000/api/posts/${id}/comments/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: comment.content
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        
        if (res.status === 401) {
          if (confirm('Сессия истекла. Пожалуйста, войдите снова.')){
            router.push(PAGES.LOGIN());
          }else{
            return;
          }
        }
        
        throw new Error( errorData.error || (res.status === 403 ? 'У вас нет прав для создания комментария.' : `Ошибка ${res.status}: Не удалось создать комментарий.`) );
      }

      router.push(`/post/view/${id}/`);
    } catch (err: any) {
      console.error('Add comment error:', err);

      if (err.message.includes('Токен') || err.message.includes('401')) {
        if (confirm('Войдите в систему')){
          router.push(PAGES.LOGIN());
        }else{
          return;
        }
      }
    }
  }

  const handleEditComment = async () => {
    const id = (await params).id;

    const token = localStorage.getItem('access_token');
    if (token) {
      router.push(`/post/view/${id}/comment/edit/`);
    }else{
      router.push('/authorization/login/');
      throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
    }
  }
  
  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить данный пост?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует.');
      }

      const res = await fetch(`http://localhost:8000/api/company/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось удалить компанию.`);
      }
      // setSuccess('Пост удален!');
    } catch (err: any) {
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  const handleCommentDelete = async () => {
    if (!confirm('Вы уверены, что хотите удалить данный коммент?')) return;
    const id = (await params).id;

    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует.');
      }

      const res = await fetch(`http://localhost:8000/api/posts/${id}/comments/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось удалить коммент.`);
      }
    } catch (err: any) {
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  if (!post) {
    return (
      <div>
        <p>Загрузка поста...</p>
      </div>
    );
  }

  return (
    <>
    <div className="post-card">
        <div className="post-header">
          {post.profile.image !== null && post.profile.image !== undefined ? (
            <Image width={100} height={100} alt='PhotoUser' src={`${post.profile.image}`} className='post-author-avatar'/>
          ) : (
            <Image width={100} height={100} alt='PhotoUser' src={ImageUser} className='post-author-avatar'/>
          )}
          <div className="post-author-info">
            <Link href={PAGES.VIEW_PROFILE(post.owner.id)} prefetch={true} onClick={(e) => { e.preventDefault(); router.push(PAGES.VIEW_PROFILE(post.owner.id), { scroll: false }); }} className="post-author-name">{post.owner.username}</Link>
            <div className="post-date">
              {format(post.created_at, 'dd MMMM yyyy HH:mm:ss', {locale: ru})}
            </div>
            {post.isDecided && (
              <Image width={20} height={20} src={CheckImage} alt="check" />
            )}
          </div>
        </div>
        <h2 className="post-title">{post.title}</h2>
        <div className="post-content">
          <p>{post.information}</p>
        </div>
        <div className="post-tags">
          <a href="" className="post-tag">
            {post.category === '1'
            ? 'ПО'
            : post.category === '2'
            ? 'Срочно'
            : post.category === '3'
            ? 'Остальное'
            : 'Не указано'}
          </a>
        </div>
        <div className="post-footer">
            <div className="post-stats">
                <div className="post-stat">
                    <span>{post.voice} голоса</span>
                </div>
            </div>
            <div className="post-actions">
                {post.isDecided ? (
                  <p>Пост закрыт</p>
                ):(
                  <></>
                )}
            </div>
        </div>
    </div>
    {post.isDecided && comments.length === 0 ? (
      <></>
    ):(
      <div className="div-comments">
        <h2>Комментарии</h2>
        {comments.length === 0 ? (
          <p style={{textAlign: 'center'}}>Пока нет комментариев. Станьте первым!</p>
        ):(
          <>
          {comments.map(comment => (
            <CartComment key={comment.id} comment={{
                content: comment.content,
                owner: comment.owner ?? '', 
                owner_id: comment.owner_id ?? 0, 
                created_at: comment.created_at ?? ''
              }}/>
          ))}
          </>
        )}
        {post.isDecided ? (
          <></>
        ):(
          <form onSubmit={handleAddComment} className="comment-form">
            <h3>Оставить комментарий</h3>
            <textarea name='content' value={comment.content} onChange={handleChange} placeholder="Напишите ваш комментарий не меньше 5 символ здесь..."></textarea>
            <button type="submit">Отправить комментарий</button>
          </form>
        )}
      </div>
    )}
    </>
  );
}
