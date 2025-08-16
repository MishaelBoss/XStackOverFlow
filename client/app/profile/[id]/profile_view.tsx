'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import Image from 'next/image';
import ImageUser from '@/public/default-avatar.png'
import ImageInformation from '@/public/information.png'
import { Post } from '@/app/shared/types/post.interface';
import { UserProfile } from '@/app/shared/types/profile.interface';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { PAGES } from '@/app/config/page.config';

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
        const profileID = (await params).id;
        const res = await fetch(`http://localhost:8000/api/profile/view/${profileID}`);
        const resPostUser = await fetch(`http://localhost:8000/api/profile/user/posts/view/${profileID}`);

        if(res.ok){
          const data = await res.json();
          setUserData({
            id: (data.id && data.id) || 0,
            username: (data.username && data.username) || '',
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
        if(resPostUser.ok){
          const data = await resPostUser.json();
          setPosts(data);
        }
      } catch (error: any) {
        const errorMessage = err.message || 'Не удалось загрузить профиль.';
        setError(errorMessage);
        if (error.message.includes('Токен') || error.message.includes('401')) {
          router.push(PAGES.LOGIN());
        }
      }
    };
    fetchProfile();
  }, [router, params]);

  if (!userData) {
    return (
      <div>
        <h1>Пользовальский кабинет</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <>
    <div>
      {error && <p className="text-red-500 mb-4">{error}</p>}
      <div className='div-profile'>
        <div className='div-profile-content'>
          {userData.image !== null && userData.image !== undefined ? (
            <Image width={100} height={100} alt='PhotoUser' src={`${userData.image}`} className='avatar'/>
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
                <li key={post.id} className="activity-item">
                  <a href={`/post/view/${post.id}`}>{post.title}</a>
                  <div className="activity-date">
                    {format(post.created_at, 'dd MMMM yyyy HH:mm:ss' , {locale: ru})}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
