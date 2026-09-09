import { LoginForm } from "@/components/organisms/LoginForm/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Iniciar sesión — IMC",
  description: "Ingresa tus credenciales para acceder al sistema IMC.",
};

export default function LoginPage() {
  return <LoginForm />;
}
