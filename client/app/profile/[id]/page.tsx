import "../profile.css"
import { Header } from "@/app/components/shared/header";
import Profile from "./profile_view";

export const metadata = {
  title: 'Просмотр профиля',
}

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
