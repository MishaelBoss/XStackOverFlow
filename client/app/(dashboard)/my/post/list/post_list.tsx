'use client'
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CartPost } from "@/app/components/shared/cart_post";
import CheckImage from '@/public/check.png'
import { Post } from "@/app/shared/types/post.interface";

export default function PostList() {
  const [posts, setPosts] = useState<Post []>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (!token) {
          throw new Error('Токен авторизации отсутствует.');
        }

        const res = await fetch('http://localhost:8000/api/my/posts/', {
          headers: {
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!res.ok) {
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить посты.`);
        }

        const data = await res.json();
        setPosts(data);
      } catch (err: any) {
        if (err.message.includes('Токен') || err.message.includes('401')) {
          router.push('/authorization/login');
        }
      }
    };
    fetchPost();
  }, [router]);

  const handleEdit = (id: number) => {
    router.push(`/my/post/edit/${id}`);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Вы уверены, что хотите удалить этот пост?')) return;
    try {
      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('Токен авторизации отсутствует.');
      }

      const res = await fetch(`http://localhost:8000/api/post/${id}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Ошибка ${res.status}: Не удалось удалить пост.`);
      }

      setPosts(posts.filter((post) => post.id !== id));
    } catch (err: any) {
      if (err.message.includes('Токен') || err.message.includes('401')) {
        router.push('/login');
      }
    }
  };

  return (
    <>
    {posts.length === 0 ? (
      <></>
      ) : (
        <div className="p-20">
          {posts.map((post) => (
            <CartPost key={post.id} post={{id: post.id, title: post.title, image: CheckImage, isDecided: post.isDecided, created_at: post.created_at}}/>
          ))}
        </div>
      )}
    </>
  );
}
