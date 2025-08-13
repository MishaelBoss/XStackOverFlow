'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import { UserProfile, Post } from '@/app/types/index.js';
import Image from 'next/image';
import ImageUser from '@/public/default-avatar.png'
import ImageInformation from '@/public/information.png'

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

        if(res.ok){
          const data = await res.json();
          setUserData(data);
        }
      } catch (err: any) {
        const errorMessage = err.message || 'Не удалось загрузить профиль.';
        setError(errorMessage);
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/authorization/login');
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
          {userData.profile.image !== null && userData.profile.image !== undefined ? (
            <Image width={100} height={100} alt='PhotoUser' src={`${userData.profile.image}`} className='avatar'/>
          ) : (
            <Image width={100} height={100} alt='PhotoUser' src={ImageUser} className='avatar'/>
          )}
          <div className='div-profile-content-info'>
            <h1>
              {userData.profile.name || ''} {userData.profile.surname || ''} {userData.profile.patronymic || ''}
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
            <span>Телефон: {userData?.profile.phone || 'Не указано'}</span>
          </div>
          <div className='info-item'>
            <span>Почта: {userData?.email || 'Не указано'}</span>
          </div>
          <div className='info-item'>
            <span>Возраст: {userData?.profile.years || 'Не указано'}</span>
          </div>
        </div>
      </div>
      {userData.profile.about ? (
      <div className='p-5'>
        <div className='info-card'>
          <h2><Image width={32} height={32} alt='photo' src={ImageInformation} style={{ borderRadius: '15px', backgroundColor: 'lightsteelblue', padding: '2px' }}/> О себе</h2>
          <div className="about-text">
            <p>
              {userData.profile.about || ''}
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
                    {post.date_crete}
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
