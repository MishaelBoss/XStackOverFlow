import PostAdd from "./post_add";
import { Header } from "@/app/components/shared/header";
import '@/app/authorization/authorization.css'

export const metadata = {
  title: 'Добавить пост',
};

export default function Page() {
  return(
    <>
    <Header/>
    <PostAdd/>
    </>
  );
}
