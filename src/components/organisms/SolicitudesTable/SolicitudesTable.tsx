"use client";

import { useEffect, useState } from "react";
import { FileText, Building2, MapPin, User, Calendar, Eye } from "lucide-react";
import Swal from "sweetalert2";
import { getSolicitudes, Solicitud } from "@/lib/services/solicitudes";
import { SEDES_MOCK } from "@/lib/constants/solicitud";

/** Mapea el valor de la sede a su label legible */
function getSedeLabel(value: string): string {
  return SEDES_MOCK.find((s) => s.value === value)?.label ?? value;
}

/** Etiqueta de clasificación con color semántico */
function ClasificacionBadge({ value }: { value: string }) {
  if (value === "TAR") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-[var(--color-danger)] border border-[var(--color-danger)]/20">
        TAR
      </span>
    );
  }
  if (value === "NO_TAR") {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-[var(--color-success)] border border-[var(--color-success)]/20">
        No TAR
      </span>
    );
  }
  return <span className="text-sm text-[var(--color-text-secondary)]">—</span>;
}

/** Etiqueta de estado */
function EstadoBadge({ estado }: { estado: string }) {
  const styles: Record<string, string> = {
    Pendiente: "bg-amber-50 text-[var(--color-warning)] border-[var(--color-warning)]/20",
    Aprobada: "bg-green-50 text-[var(--color-success)] border-[var(--color-success)]/20",
    Rechazada: "bg-red-50 text-[var(--color-danger)] border-[var(--color-danger)]/20",
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${styles[estado] ?? ""}`}>
      {estado}
    </span>
  );
}

export function SolicitudesTable() {
  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setSolicitudes(getSolicitudes());
    setRole(localStorage.getItem("userRole"));
  }, []);

  const handleVerDetalle = (sol: Solicitud) => {
    Swal.fire({
      title: `<span style="color:var(--color-primary);font-size:1.1rem">${sol.empresa}</span>`,
      html: `
        <div style="text-align:left;font-size:0.875rem;line-height:1.7;color:var(--color-title)">
          <p><strong>Descripción:</strong> ${sol.descripcion}</p>
          <p><strong>Sede:</strong> ${getSedeLabel(sol.sede)}</p>
          <p><strong>Solicitante:</strong> ${sol.nombreSolicitante}</p>
          <p><strong>Celular:</strong> ${sol.celular}</p>
          <p><strong>Correo:</strong> ${sol.correo}</p>
          <p><strong>Clasificación:</strong> ${sol.clasificacion === "TAR" ? "Alto riesgo (TAR)" : sol.clasificacion === "NO_TAR" ? "No alto riesgo" : "—"}</p>
          <p><strong>Registrada:</strong> ${new Date(sol.fechaCreacion).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <p><strong>Creado por:</strong> ${sol.creadoPor}</p>
        </div>
      `,
      confirmButtonColor: "var(--color-primary)",
      confirmButtonText: "Cerrar",
      width: 480,
    });
  };

  if (solicitudes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-[var(--color-primary-light)] rounded-full mb-4">
          <FileText size={40} className="text-[var(--color-primary)]" strokeWidth={1.5} />
        </div>
        <h2 className="text-lg font-bold text-[var(--color-title)] mb-1">
          No hay solicitudes registradas
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
          Las solicitudes creadas aparecerán aquí. Crea una nueva desde el menú lateral.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-[var(--color-border)]">
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><Building2 size={13} /> Empresa</div>
            </th>
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><User size={13} /> Solicitante</div>
            </th>
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><MapPin size={13} /> Sede</div>
            </th>
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              Clasificación
            </th>
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              Estado
            </th>
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              <div className="flex items-center gap-1.5"><Calendar size={13} /> Fecha</div>
            </th>
            <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
              Acción
            </th>
          </tr>
        </thead>
        <tbody>
          {solicitudes.map((sol) => (
            <tr
              key={sol.id}
              className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-primary-light)]/30 transition-colors duration-100"
            >
              <td className="px-4 py-3 font-medium text-[var(--color-title)]">
                {sol.empresa}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {sol.nombreSolicitante}
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {getSedeLabel(sol.sede)}
              </td>
              <td className="px-4 py-3">
                <ClasificacionBadge value={sol.clasificacion} />
              </td>
              <td className="px-4 py-3">
                <EstadoBadge estado={sol.estado} />
              </td>
              <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                {new Date(sol.fechaCreacion).toLocaleDateString("es-PE", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => handleVerDetalle(sol)}
                  className="
                    inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                    text-xs font-semibold
                    text-[var(--color-primary)] bg-[var(--color-primary-light)]
                    border border-[var(--color-primary)]/15
                    cursor-pointer
                    transition-all duration-150
                    hover:bg-[var(--color-primary)] hover:text-white
                  "
                  aria-label={`Ver detalle de solicitud ${sol.empresa}`}
                >
                  <Eye size={13} />
                  Ver
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
