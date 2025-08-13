import { User } from "./user.interface";

export interface UserProfile extends User { 
    name: string;
    surname: string;
    patronymic: string;
    phone: string;
    about: string;
    years: string;
    image: File | null;
}