"use client"
import { useState, FormEvent, ChangeEvent } from 'react';
import { UserRegister } from '@/app/types/index.js';
import { useRouter } from 'next/navigation'
import Link from 'next/link';
import { PAGES } from '@/app/config/page.config';

export default function Register() {
  const [formData, setFormData] = useState<UserRegister>({
    username: "",
    email: "",
    password: "",
    name: "",
    surname: "",
    patronymic: "",
    phone: "",
    about: "",
    years: "",
    image: null,
  });
  const [error, setError] = useState<string>('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const router = useRouter()

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    setImagePreview(null);
  };
  
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formDataToSend = new FormData();
    formDataToSend.append("username", formData.username || '');
    formDataToSend.append("email", formData.email || '');
    formDataToSend.append("password", formData.password || '');
    formDataToSend.append("name", formData.name);
    formDataToSend.append("surname", formData.surname);
    formDataToSend.append("patronymic", formData.patronymic);
    formDataToSend.append("phone", formData.phone);
    formDataToSend.append("about", formData.about);
    formDataToSend.append("years", formData.years);
    if (formData.image) formDataToSend.append("image", formData.image);

    for (let [key, value] of formDataToSend.entries()) {
      console.log(`${key}: ${value}`);
    }

    try {
    const res = await fetch("http://localhost:8000/register/", {
        method: "POST",
        body: formDataToSend,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Не удалось зарегистрироваться.');
      }

      const data = await res.json();
      localStorage.setItem('access_token', data.access);
      setError('');
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Не удалось зарегистрироваться.');
      console.error('Registration error:', err);
    }
  };
  
  return (
    <div className='div-authorization'>
      <form onSubmit={handleSubmit} className='div-form-authorization'>
        <h1>Зарегистрироваться на сайт</h1>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        <div className="div-form-authorization-content">
          <div>
              <label>Введите логин</label>
              <input type="text" minLength={4} name="username" placeholder="логин < 4 симвл" value={formData.username} onChange={handleChange}></input>
          </div>
          <div>
              <label>Введите почту</label>
              <input type="text" minLength={4} name="email" placeholder="почта < 4 симвл" value={formData.email} onChange={handleChange}></input>
          </div>
          <div>
              <label>Имя</label>
              <input type="text" minLength={4} name="name" placeholder="имя < 4 симвл" value={formData.name} onChange={handleChange}></input>
          </div>
          <div>
              <label>Фамилия</label>
              <input type="text" minLength={4} name="surname" placeholder="фамилия < 4 симвл" value={formData.surname} onChange={handleChange}></input>
          </div>
          <div>
              <label>Отчество</label>
              <input type="text" minLength={4} name="patronymic" placeholder="отчество < 4 симвл" value={formData.patronymic} onChange={handleChange}></input>
          </div>
          <div>
              <label>Номер телефона</label>
              <input type="tel" minLength={4} name="phone" placeholder="телефон < 4 симвл" value={formData.phone} onChange={handleChange}></input>
          </div>
          <div>
              <label>О собе</label>
              <textarea minLength={1} name="about" placeholder="о себе < 1 симвл" value={formData.about} onChange={handleChange}></textarea>
          </div>
          <div>
              <label>Сколько лет</label>
              <input type="text" minLength={1} name="years" placeholder="лет < 1 симвл" value={formData.years} onChange={handleChange}></input>
          </div>
          <div>
              <label>Введите пароль</label>
              <input type="password" name="password" placeholder="пароль" value={formData.password} onChange={handleChange}></input>
          </div>
          <div>
            <label className="block text-gray-700">фото пользователя</label>
            <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="w-full border rounded-md p-2" />
            {imagePreview && (
            <div className="mt-2">
              <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
              <button type="button" onClick={handleRemoveImage} className="mt-2 text-red-500 hover:underline"> Удалить изображение</button>
            </div>
            )}
          </div>
          <button type="submit">Зарегистрироваться</button>
          <p>Нет аккаунта? <Link href={PAGES.LOGIN()} prefetch={true} onClick={(e) => { e.preventDefault(); router.push(PAGES.LOGIN(), { scroll: false }); }}>Войти</Link></p>
        </div>
      </form>
    </div>
  );
}
