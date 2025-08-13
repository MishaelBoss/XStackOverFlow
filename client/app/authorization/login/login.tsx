"use client"
import { FormEvent, useState } from 'react';
import { User } from '@/app/types/index.js';
import { useRouter } from 'next/navigation'
import "../authorization.css";
import Link from 'next/link';
import { PAGES } from '@/app/config/page.config';

export default function Login() {
  const [formData, setFormData] = useState<User>({
    id: 0,
    username: '',
    password: '',
  });
  const [error, setError] = useState<string>('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value.trim() });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!formData.username || !formData.password) {
        throw new Error('Логин и пароль обязательны');
      }
      const res = await fetch('http://localhost:8000/login/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('access_token', data.access);
        router.push(`/`);
      }
      else{
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось войти.`);
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Login error:', err);
    }
  };
  
  return (
    <div className='div-authorization'>
      <form onSubmit={handleSubmit} className='div-form-authorization'>
          <h1>Добро пожаловать</h1>
          {error && <p>{error}</p>}
          <div className="div-form-authorization-content">
            <div>
                <label>Введите логин</label>
                <input type="text" name="username" value={formData.username} onChange={handleChange} placeholder="логин" required></input>
            </div>
            <div>
                <label>Введите пароль</label>
                <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="пароль" required></input>
            </div>
            <button type="submit">Войти</button>
            <p>Уже есть аккаунт? <Link href={PAGES.REGISTER()} prefetch={true} onClick={(e) => { e.preventDefault(); router.push(PAGES.REGISTER(), { scroll: false }); }}>Регистрация</Link></p>
          </div>
      </form>
    </div>
  );
}
