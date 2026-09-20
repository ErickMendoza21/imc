import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { SolicitudesTable } from "@/components/organisms/SolicitudesTable";

export const metadata: Metadata = {
  title: "Mis solicitudes — IMC",
  description: "Consulta el listado de solicitudes registradas en el sistema IMC.",
};

export default function MisSolicitudesPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Encabezado de página ── */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--color-primary-light)] rounded-xl">
          <FileText size={28} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-title)] leading-tight">
            Mis solicitudes
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Consulta y revisa las solicitudes registradas en el sistema.
          </p>
        </div>
      </div>

      {/* ── Tabla ── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
        <SolicitudesTable />
      </div>
    </div>
  );
}
