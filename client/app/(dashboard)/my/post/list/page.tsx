import PostList from "./post_list";
import { Header } from "@/app/components/shared/header";

export const metadata = {
  title: 'Список моих постов',
};

export default function Page() {
  return(
    <>
    <Header/>
    <PostList/>
    </>
  );
}
