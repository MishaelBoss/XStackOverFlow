import Login from "./login";
import "../authorization.css";
import { Header } from "@/app/components/shared/header";

export const metadata = {
  title: 'Авторизация',
};

export default function Page() {
  return (
    <>
    <Header/>
    <Login/>
    </>
  );
}
