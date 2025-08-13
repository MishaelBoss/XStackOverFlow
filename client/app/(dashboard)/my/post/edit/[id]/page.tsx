import PostEdit from "./post_edit";
import { Header } from "@/app/components/shared/header";
import '@/app/authorization/authorization.css'

export const metadata = {
  title: 'Изменить пост',
};

type Props = {
  params: Promise<{ id: bigint }>
}

export default function Page({params}: Props) {
  return (
    <>
    <Header/>
    <PostEdit params={params}/>
    </>
  );
}
