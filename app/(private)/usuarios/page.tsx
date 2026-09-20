import type { Metadata } from "next";
import { GestionUsuarios } from "@/components/organisms/CrearUsuarioForm";

export const metadata: Metadata = {
  title: "Usuarios — IMC",
  description: "Gestión de usuarios del sistema IMC.",
};

export default function UsuariosPage() {
  return <GestionUsuarios />;
}
