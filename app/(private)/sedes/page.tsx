import { Metadata } from "next";
import { SedesTable } from "@/components/organisms/SedesTable";

export const metadata: Metadata = {
  title: "Gestión de Sedes | IMC",
  description: "Administración de sedes y disponibilidad para solicitudes.",
};

export default function SedesPage() {
  return <SedesTable />;
}
