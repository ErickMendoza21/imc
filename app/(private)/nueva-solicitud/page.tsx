import type { Metadata } from "next";
import { NuevaSolicitudForm } from "@/components/organisms/NuevaSolicitudForm";

export const metadata: Metadata = {
  title:       "Nueva solicitud — IMC",
  description: "Registra una nueva solicitud de servicio en el sistema IMC.",
};

export default function NuevaSolicitudPage() {
  return <NuevaSolicitudForm />;
}
