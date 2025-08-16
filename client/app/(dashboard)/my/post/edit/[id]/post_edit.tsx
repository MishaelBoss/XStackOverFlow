"use client"
import { PAGES } from "@/app/config/page.config";
import { Post } from "@/app/shared/types/post.interface";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
  params: Promise<{ id: bigint }>
}

export default function PostEdit({ params }: Props) {
    const [formData, setFormData] = useState<Post>({
        id: 0,
        title: '',
        information: '',
        image: null,
        category: '',
        created_at: '',
        isDecided: false,
        voice: '',
        owner: '',
        name: '',
        surname: '',
        patronymic: '',
        phone: '',
        about: '',
        years: '',
        username: '',
        password: '',
    });
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const router = useRouter()

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (!token) {
                    throw new Error('Токен авторизации отсутствует.');
                }

                const id = (await params).id;

                const res = await fetch(`http://localhost:8000/api/post/${id}/`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                });

                if (res.ok) {
                    const data = await res.json();
                    setFormData(data);
                }else{
                    const errorData = await res.json().catch(() => ({}));
                    throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось загрузить пост или ее нету.`);
                }

                if (res.status === 403) {
                    router.push(PAGES.HOME());
                }
            } catch (err: any) {
                if (err.message.includes('Токен') || err.message.includes('401')) {
                    router.push(PAGES.LOGIN());
                }
                router.push(PAGES.HOME());
                throw new Error(err);
            }
        };
        fetchPost();
    }, [router, params]);

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
                throw new Error('Токен авторизации отсутствует.');
            }
            
            const id = (await params).id;

            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title.toString());
            formDataToSend.append('information', formData.information.toString());
            formDataToSend.append('category', formData.category.toString());
            if (formData.image) formDataToSend.append('image', formData.image);
            for (let [key, value] of formDataToSend.entries()) {
                console.log(`${key}: ${value}`);
            }

            const res = await fetch(`http://localhost:8000/api/post/${id}/`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: formDataToSend,
            });

            if (res.ok) {
                router.push(PAGES.MY_POST());
            } else {
                const errorData = await res.json().catch(() => ({}));
                console.log('Server error response:', errorData);

                if (res.status === 401) {
                    router.push(PAGES.LOGIN());
                    throw new Error('Сессия истекла. Пожалуйста, войдите снова.');
                }

                if (res.status === 403) {
                    router.push(PAGES.HOME());
                    throw new Error(errorData.error || 'У вас нет прав для редактирования этого поста.');
                }
                throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось редактировать пост.`);
            }
        } catch (err: any) {
            console.error('Edit post error:', err);
        }
    };
    return (
        <div className='div-authorization'>
            <form onSubmit={handleSubmit} className='div-form-authorization'>
                <h1>Форма изменения поста</h1>
                <div className="div-form-authorization-content">
                    <div>
                        <label>Заголовок</label>
                        <input type="text" name='title' value={formData.title} onChange={handleChange} required/>
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
                    <button type="submit">Изменить</button>
                </div>
            </form>
        </div>
    );
}