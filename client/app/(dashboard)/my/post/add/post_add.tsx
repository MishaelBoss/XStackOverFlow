"use client"
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Post } from "@/app/types";
import { PAGES } from "@/app/config/page.config";

export default function PostAdd() {
    const [formData, setFormData] = useState<Post>({
        id: undefined,
        title: '',
        information: '',
        image: null,
        category: '',
        date_crete: '',
        isDecided: false,
        voice: '',
        owner: '',
        profile: {
            name: '',
            surname: '',
            patronymic: '',
            phone: '',
            about: '',
            years: '',
            image: null,
        }
    });
    const [error, setError] = useState<string>('');
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter()

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ 
            ...formData, 
            [e.target.name]: e.target.value 
        });
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
        const token = localStorage.getItem('access_token');
        if (!token) {
            throw new Error('Токен авторизации отсутствует. Пожалуйста, войдите снова.');
        }
        
        const formDataToSend = new FormData();
        formDataToSend.append('title', formData.title.toString());
        formDataToSend.append('information', formData.information.toString());
        formDataToSend.append('category', formData.category.toString());
        if (formData.image) formDataToSend.append('image', formData.image);
        for (let [key, value] of formDataToSend.entries()) {
            console.log(`${key}: ${value}`);
        }

        const res = await fetch('http://localhost:8000/api/post/add/', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formDataToSend,
        });

        if (res.ok) {
            router.push(PAGES.MY_POST());
        }
        else{
            const errorData = await res.json().catch(() => ({}));
            console.log('Server error response:', errorData);
            if (res.status === 401) {
                router.push(PAGES.LOGIN());
                throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
            }
            if (res.status === 403) {
                throw new Error(errorData.error || 'У вас нет прав для создания вопроса.');
            }
            throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось создать вопрос.`);
        }
        } catch (err: any) {
        setError(err.message);
        console.error('Add post error:', err);
        }
    };
    return (
        <div className='div-authorization'>
            <form onSubmit={handleSubmit} className='div-form-authorization'>
                <h1>Форма добавление вопроса</h1>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <div className="div-form-authorization-content">
                <div>
                    <label>Заголовок</label>
                    <input type="text" name='title' value={formData.title} onChange={handleChange} placeholder="Заголовок" required/>
                </div>
                <div>
                    <label>Проблема</label>
                    <textarea name='information' value={formData.information} onChange={handleChange} placeholder="Опиши проблему" required/>
                </div>
                <div>
                    <label className="block text-gray-700">фото проблемы</label>
                    <input type="file" name="image" accept="image/*" onChange={handleFileChange} className="w-full border rounded-md p-2" />
                    {imagePreview && (
                        <div className="mt-2">
                        <img src={imagePreview} alt="Preview" className="w-32 h-32 object-cover rounded" />
                        <button type="button" onClick={handleRemoveImage} className="mt-2 text-red-500 hover:underline"> Удалить изображение</button>
                        </div>
                    )}
                </div>
                <div>
                    <label htmlFor="category">Категория:</label>
                    <select name="category" value={formData.category} onChange={handleChange}>
                        <option value="1">ПО</option>
                        <option value="2">Срочно</option>
                        <option value="3">Остальное</option>
                    </select>
                </div>
                <button type="submit">Добавить</button>
                </div>
            </form>
        </div>
    );
}
