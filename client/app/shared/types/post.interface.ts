import { UserProfile } from "./profile.interface";

export interface Post extends UserProfile{
    id: number;
    title: string;
    information: string;
    image: File | null;
    category: string;
    created_at: string;
    isDecided: boolean | false;
    voice: string;
    owner: string;
}