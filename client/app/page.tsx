'use client'
import { useEffect, useState } from "react";
import { Post } from "./shared/types/post.interface";
import CheckImage from '@/public/check.png'
import { Header } from "./components/shared/header";
import { CartPost } from "./components/shared/cart_post";

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/posts/', {
          headers: { 'Accept': 'application/json' },
        });
        if (res.ok) {
          const data = await res.json();
          setPosts(data);
        } else {
          throw new Error(`Ошибка ${res.status}: Не удалось загрузить посты.`);
        }
      } catch (err: any) {
        console.error('Fetch posts error:', err);
      }
    };
    fetchPost();
  }, []);

  return (
    <>
    <Header/>
    <div className="p-20">
      <ul className="activity-list">
        {posts.map(post => (
          <CartPost key={post.id} post={{id: post.id, title: post.title, image: CheckImage, isDecided: post.isDecided, created_at: post.created_at}}/>
        ))}
      </ul>
    </div>
    </>
  );
}
