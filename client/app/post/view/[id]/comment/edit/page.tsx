'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { Comment } from '@/app/types/index.js';
import '@/app/authorization/authorization.css'    

type Props = {
  params: Promise<{ id: string }>
}

export default function CommentAdd({ params }: Props) {
  const [error, setError] = useState<string>('');
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
    const checkAuth = async () => {
      const id = (await params).id;
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/authorization/login');
      }

      try{
        const res = await fetch(`http://localhost:8000/api/company/${id}/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(
            `Ошибка ${res.status}: ${
              errorData.error || res.statusText || 'Неизвестная ошибка'
            }`
          );
        }

        const data = await res.json();
        setComment(data);
      }catch (err: any) {
        setError(err.message);
        console.error('Fetch company error:', err);
      }
    };
    checkAuth();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const id = (await params).id;
      const token = localStorage.getItem('access_token');
      
      if (!token) {
        throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
      }
      
      const res = await fetch(`http://localhost:8000/api/posts/${id}/comments/`, {
        method: 'PUT',
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
          router.push('/authorization/login');
          throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
        }
        
        throw new Error(
          errorData.error || 
          (res.status === 403 ? 'У вас нет прав для изменения комментария.' : 
          `Ошибка ${res.status}: Не удалось изменить комментарий.`)
        );
      }

      router.push(`/post/view/${id}/`);
    } catch (err: any) {
      setError(err.message);
      console.error('Add comment error:', err);
    }
  };

  return (
    <div className='div-authorization'>
      <form onSubmit={handleSubmit} className='div-form-authorization'>
        <h1>Изменить комментарий</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="div-form-authorization-content">
          <div>
            <textarea name='content' value={comment.content}  onChange={handleChange}  placeholder="" required>{comment.content}</textarea>
          </div>
          <button type="submit">Изменить комментарий</button>
        </div>
      </form>
    </div>
  );
}