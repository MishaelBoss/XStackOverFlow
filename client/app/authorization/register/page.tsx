import Register from "./register";
import "../authorization.css";
import { Header } from "@/app/components/shared/header";

export const metadata = {
  title: 'Регистрация',
};

export default function Page() {
  return (
    <>
    <Header/>
    <Register/>
    </>
  );
}
