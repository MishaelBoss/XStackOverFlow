import "../profile.css"
import Profile from "./my_profile"
import { Header } from "@/app/components/shared/header";

export const metadata = {
  title: 'Мой профиль',
};

type Props = {
  params: Promise<{ id: string }>
}

export default function Page({ params }: Props) {
  return (
    <>
    <Header/>
    <Profile params={params}/>
    </>
  );
}
