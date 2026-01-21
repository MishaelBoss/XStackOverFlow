'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import "../profile.css"
import Image from 'next/image';
import ImageUser from '@/public/default-avatar.png'
import ImageInformation from '@/public/information.png'
import CheckImage from '@/public/check.png'
import { CartPost } from '@/app/components/shared/cart_post';
import { PAGES } from '@/app/config/page.config';
import { Post } from '@/app/shared/types/post.interface';
import { UserProfile } from '@/app/shared/types/profile.interface';

type Props = {
  params: Promise<{ id: string }>
}

export default function Profile({ params }: Props) {
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState<string>('');
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует.');
        }

        const res = await fetch(`http://localhost:8000/api/profile/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const resPosts = await fetch('http://localhost:8000/api/my/posts/', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if(res.ok){
          const data = await res.json();
          setUserData({
            id: (data.id && data.id) || 0,
            username: (data.username && data.username) || '',
            password: (data.possword && data.password) || '',
            email: (data.email && data.email) || '',
            name: (data.profile && data.profile.name) || '',
            surname: (data.profile && data.profile.surname) || '',
            patronymic: (data.profile && data.profile.patronymic) || '',
            phone: (data.profile && data.profile.phone) || '',
            about: (data.profile && data.profile.about) || '',
            years: (data.profile && data.profile.years) || '',
            image: (data.profile && data.profile.image) || '',
          });
        }
        else{
          throw new Error(`Ошибка ${resPosts.status}: Не удалось загрузить профиль.`);
        }

        if (resPosts.ok) {
          const data = await resPosts.json();
          setPosts(data);
        }else{
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить посты.`);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Не удалось загрузить профиль.';
        setError(errorMessage);
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push(PAGES.LOGIN());
        }
      }
    };
    fetchProfile();
  }, [router, params]);

  if (!userData) {
    return (
      <div>
        <h1>Личный кабинет</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p>Загрузка...</p>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await fetch('http://localhost:8000/logout/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push('/authorization/login');
    } catch (err: any) {
      console.error('Logout failed:', err);
    }
  };

  return (
  <>
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className='div-profile'>
        <div className='div-profile-content'>
          {userData.image !== null && userData.image !== undefined ? (
            <Image width={100} height={100} alt='PhotoUser' src={`http://localhost:8000${userData.image}`} className='avatar'/>
          ) : (
            <Image width={100} height={100} alt='PhotoUser' src={ImageUser} className='avatar'/>
          )}
          <div className='div-profile-content-info'>
            <h1>
              {userData.name || ''} {userData.surname || ''} {userData.patronymic || ''}
            </h1>
            <h2>
              {userData.username}
            </h2>
            <div className='div-profile-content-info-action'>
              <a style={{color: '#8A2BE2'}} onClick={() => router.push(`/my/post/add`, { scroll: false })}>Задать новый вопрос</a>
              <a style={{color: '#8A2BE2'}} onClick={() => router.push(`/my/post/list/`, { scroll: false })}>Мои посты</a>
              <a onClick={() => router.push(`./edit`, { scroll: false })}>Редактировать аккаунт</a>
              <a onClick={handleLogout} style={{ color: 'red' }}>Выйти</a>
            </div>
          </div>
        </div>
      </div>
      <div className='p-5'>
        <div className='info-card'>
          <h2><Image width={32} height={32} alt='photo' src={ImageInformation} style={{ borderRadius: '15px', backgroundColor: 'lightsteelblue', padding: '2px' }}/> Личные данные</h2>
          <div className='info-item'>
            <span>Телефон: {userData?.phone || 'Не указано'}</span>
          </div>
          <div className='info-item'>
            <span>Почта: {userData?.email || 'Не указано'}</span>
          </div>
          <div className='info-item'>
            <span>Возраст: {userData?.years || 'Не указано'}</span>
          </div>
        </div>
      </div>
      {userData.about ? (
      <div className='p-5'>
        <div className='info-card'>
          <h2><Image width={32} height={32} alt='photo' src={ImageInformation} style={{ borderRadius: '15px', backgroundColor: 'lightsteelblue', padding: '2px' }}/> О себе</h2>
          <div className="about-text">
            <p>
              {userData.about || ''}
            </p>
          </div>
        </div>
      </div>
      ) : null}
      <div className='p-5'>
        <div className='info-card'>
          <h2><Image width={32} height={32} alt='photo' src={ImageInformation} style={{ borderRadius: '15px', backgroundColor: 'lightsteelblue', padding: '2px' }}/> Вопросы</h2>
          <div className="about-text">
            <ul className="activity-list">
              {posts.map(post => (
                <CartPost key={post.id} post={{id: post.id, title: post.title, image: CheckImage, isDecided: post.isDecided, created_at: post.created_at}}/>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
