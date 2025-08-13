import Post from "./post_view";
import '../../post.css'
import '../../comment.css'
import { Header } from "@/app/components/shared/header";

export const metadata = {
  title: 'Пост',
};

type Props = {
  params: Promise<{ id: string }>
}

export default function Page({ params }: Props){
  return(
    <>
    <Header/>
    <Post params={params}/>
    </>
  );
}