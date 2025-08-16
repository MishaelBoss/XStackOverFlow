'use client'
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import "./header.css";
import { PAGES } from '@/app/config/page.config';

interface Props{
  className?: string;
}

const menuItemsStatic = [
  { text: "Главная", href: PAGES.HOME() },
];

const menuItemsNotLogin = [
  { text: "Войти", href: PAGES.LOGIN() },
];

const menuItemsLogin = [
  { text: "Профиль", href: PAGES.MY_PROFILE() },
];

export const Header: React.FC<Props> = ({ className }) => {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        if (token) {
          setIsAuthenticated(true);
        }
        else{
          setIsAuthenticated(false);
        }

        const res = await fetch('http://localhost:8000/api/profile/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
        }
      } catch (error) {
        console.error('Error checking auth:', error);
        setIsAuthenticated(false);
        localStorage.removeItem('access_token');
      }
    };
    checkAuth();
  }, []);

  return(
    <header className={`header ${className || ''}`}>
    <div className="Header-content">
      <div className="Header-content-left">
        <></>
      </div>
      <div className="Header-content-right">
        {menuItemsStatic.map(({ text, href }, index) => (
          <Link
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(href, { scroll: false });
            }}
          >
            {text}
          </Link>
        ))}
        {!isAuthenticated && menuItemsNotLogin.map(({ text, href }, index) => (
            <Link 
              key={index} 
              href={`${href}`}
              onClick={(e) => {
                e.preventDefault();
                router.push(`${href}`, { scroll: false });
              }}
            >
              {text}
            </Link>
        ))}
        {isAuthenticated && menuItemsLogin.map(({ text, href }, index) => (
          <Link
            key={index}
            href={href}
            onClick={(e) => {
              e.preventDefault();
              router.push(`${href}`, { scroll: false });
            }}
          >
            {text}
          </Link>
        ))}
      </div>
    </div>
  </header>
  );
}