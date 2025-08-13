export interface User {
  id?: number | undefined;
  username?: string;
  password?: string;
  email?: string;
}

export interface UserProfileData { 
  name: string;
  surname: string;
  patronymic: string;
  phone: string;
  about: string;
  years: string;
  image: File | null;
}

export interface UserProfile extends User {
  profile: UserProfileData;
}

export interface UserTest{
  username?: string;
  password?: string;
  email?: string;
  name: string;
  surname: string;
  patronymic: string;
  phone: string;
  about: string;
  years: string;
  image: File | null;
}

export interface UserRegister extends User, UserProfileData { 
}

export interface UserLogin{
  username: string;
  password: string;
}

export interface Post extends UserProfile{
  id: number | undefined;
  title: string;
  information: string;
  image: File | null;
  category: string;
  date_crete: string;
  isDecided: boolean | false;
  voice: string;
  owner: string;
}

export interface Comment{
  id?: number;
  owner?: string;
  owner_id?: number;
  content: string;
  created_at?: string;
  updated_at?: string;
}