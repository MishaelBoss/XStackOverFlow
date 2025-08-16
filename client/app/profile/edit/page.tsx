"use client"
import { useState, FormEvent, ChangeEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation'
import '@/app/authorization/authorization.css'
import { UserProfile } from '@/app/shared/types/profile.interface';

export default function EditProfile() {
  const [formData, setFormData] = useState<UserProfile>({
    id: 0,
    username: '',
    password: '',
    email: '',
    name: '',
    surname: '',
    patronymic: '',
    phone: '',
    about: '',
    years: '',
    image: null,
  });
  const [error, setError] = useState<string>('');
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          router.push('/login');
          return;
        }
        const res = await fetch('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setFormData({
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
        }else{
          throw new Error('Не удалось загрузить данные профиля.');
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Fetch profile error:', err);
      }
    };
    fetchProfile();
  }, [router]);
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        router.push('/login');
        return;
      }
      const res = await fetch('http://localhost:8000/api/profile/', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        setFormData(prevData => ({
          ...prevData,
          username: data.username,
          email: data.email,
          password: data.password,
          profile: {
            name: data.profile.name,
            surname: data.profile.surname,
            patronymic: data.profile.patronymic,
            phone: data.profile.phone,
            about: data.profile.about,
            years: data.profile.years,
            image: data.profile.image,
          },
        }));
        setError('');
        setTimeout(() => {
          router.push(`/profile/${formData.id}`);
        }, 2000);
      }else{
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Не удалось изменить профиль');
      }

      setError('');
      router.push('/profile/4')
    } catch (err: any) {
      setError(err.message || 'Не удалось изменить профиль');
      console.error('Registration error:', err);
    }
  };
  
  return (
    <div className='div-authorization'>
      <form onSubmit={handleSubmit} className='div-form-authorization'>
        <h1>Редактировать профиль</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="div-form-authorization-content">
          <div>
              <label>Введите логин</label>
              <input type="text" name="username" placeholder="логин < 4 симвл" value={formData.username} onChange={handleChange}></input>
          </div>
          <div>
              <label>Введите почту</label>
              <input type="text" name="email" placeholder="почта < 4 симвл" value={formData.email} onChange={handleChange}></input>
          </div>
          <div>
              <label>Имя</label>
              <input type="text" name="name" placeholder="имя < 4 симвл" value={formData.name} onChange={handleChange}></input>
          </div>
          <div>
              <label>Фамилия</label>
              <input type="text" name="surname" placeholder="фамилия < 4 симвл" value={formData.surname} onChange={handleChange}></input>
          </div>
          <div>
              <label>Отчество</label>
              <input type="text" name="patronymic" placeholder="отчество < 4 симвл" value={formData.patronymic} onChange={handleChange}></input>
          </div>
          <div>
              <label>Номер телефона</label>
              <input type="tel" name="phone" placeholder="телефон < 4 симвл" value={formData.phone} onChange={handleChange}></input>
          </div>
          <div>
              <label>About</label>
              <textarea name="about" placeholder="лет < 1 симвл" value={formData.about} onChange={handleChange}></textarea>
          </div>
          <div>
              <label>Сколько лет</label>
              <input type="text" name="years" placeholder="лет < 1 симвл" value={formData.years} onChange={handleChange}/>
          </div>
          <div>
              <label>Введите пароль</label>
              <input type="password" minLength={1} name="password" placeholder="пароль" value={formData.password || ''} onChange={handleChange}/>
          </div>
          <div>
              <label>Добавьте фото</label>
              <input type="file" id="fileUpload" name="image" accept="image/*" onChange={handleChange}/>
          </div>
          <button type="submit">Сохранить изменения</button>
        </div>
      </form>
    </div>
  );
}
