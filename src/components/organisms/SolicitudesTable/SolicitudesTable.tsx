"use client";

import { useEffect, useState, useMemo } from "react";
import {
  FileText,
  Building2,
  MapPin,
  User,
  Calendar,
  Eye,
  Hash,
  Search,
  Filter,
  RotateCcw,
  CheckCircle2,
  Clock,
  XCircle,
} from "lucide-react";
import Swal from "sweetalert2";
import { getSolicitudes, Solicitud } from "@/lib/services/solicitudes";
import { getSedeLabel } from "@/lib/services/sedes";
import { Input } from "@/components/atoms/Input";
import { Button } from "@/components/atoms/Button";

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

  // Estados para filtros
  const [searchCodigo, setSearchCodigo] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [filtroClasificacion, setFiltroClasificacion] = useState<string>("TODAS");
  const [fechaDesde, setFechaDesde] = useState<string>("");
  const [fechaHasta, setFechaHasta] = useState<string>("");

  useEffect(() => {
    setSolicitudes(getSolicitudes());
    setRole(localStorage.getItem("userRole"));
  }, []);

  const handleResetFilters = () => {
    setSearchCodigo("");
    setFiltroEstado("TODOS");
    setFiltroClasificacion("TODAS");
    setFechaDesde("");
    setFechaHasta("");
  };

  const hasActiveFilters =
    searchCodigo.trim() !== "" ||
    filtroEstado !== "TODOS" ||
    filtroClasificacion !== "TODAS" ||
    fechaDesde !== "" ||
    fechaHasta !== "";

  // Filtrado reactivo de solicitudes
  const filteredSolicitudes = useMemo(() => {
    return solicitudes.filter((sol) => {
      // 1. Filtro por código o texto (empresa, contratista)
      if (searchCodigo.trim()) {
        const query = searchCodigo.trim().toLowerCase();
        const matchCodigo = sol.codigo?.toLowerCase().includes(query);
        const matchEmpresa = sol.empresa?.toLowerCase().includes(query);
        const matchContratista = sol.nombreSolicitante?.toLowerCase().includes(query);
        if (!matchCodigo && !matchEmpresa && !matchContratista) {
          return false;
        }
      }

      // 2. Filtro por estado
      if (filtroEstado !== "TODOS") {
        if (sol.estado !== filtroEstado) return false;
      }

      // 3. Filtro por clasificación
      if (filtroClasificacion !== "TODAS") {
        if (sol.clasificacion !== filtroClasificacion) return false;
      }

      // 4. Filtro por rango de fecha
      if (fechaDesde) {
        const solFecha = new Date(sol.fechaCreacion);
        const desde = new Date(`${fechaDesde}T00:00:00`);
        if (solFecha < desde) return false;
      }

      if (fechaHasta) {
        const solFecha = new Date(sol.fechaCreacion);
        const hasta = new Date(`${fechaHasta}T23:59:59`);
        if (solFecha > hasta) return false;
      }

      return true;
    });
  }, [solicitudes, searchCodigo, filtroEstado, filtroClasificacion, fechaDesde, fechaHasta]);

  const handleVerDetalle = (sol: Solicitud) => {
    let multiDocsHtml = "";
    if (sol.fichasEpp && sol.fichasEpp.length > 0) {
      multiDocsHtml += `<p style="margin-top:6px"><strong>Fichas técnicas de EPP (${sol.fichasEpp.length}):</strong><br>${sol.fichasEpp.map(e => `• ${e.nombre || "EPP"}: <em>${e.archivoNombre || "Adjunto"}</em>`).join("<br>")}</p>`;
    }
    if (sol.especificacionesQuimicos && sol.especificacionesQuimicos.length > 0) {
      multiDocsHtml += `<p style="margin-top:6px"><strong>Especificaciones de químicos (${sol.especificacionesQuimicos.length}):</strong><br>${sol.especificacionesQuimicos.map(q => `• ${q.nombre || "Químico"}: <em>${q.archivoNombre || "Adjunto"}</em>`).join("<br>")}</p>`;
    }
    if (sol.certificadosCalibracion && sol.certificadosCalibracion.length > 0) {
      multiDocsHtml += `<p style="margin-top:6px"><strong>Certificados de calibración (${sol.certificadosCalibracion.length}):</strong><br>${sol.certificadosCalibracion.map(c => `• ${c.nombre || "Equipo"}: <em>${c.archivoNombre || "Adjunto"}</em> (${c.fecha || "Sin fecha"})`).join("<br>")}</p>`;
    }
    if (sol.vehiculos && sol.vehiculos.length > 0) {
      multiDocsHtml += `<p style="margin-top:6px"><strong>Vehículos (${sol.vehiculos.length}):</strong><br>${sol.vehiculos.map(v => `• <span style="font-family:monospace;font-weight:bold">${v.placa}</span> - ${v.marca} (${v.color})`).join("<br>")}</p>`;
    }

    Swal.fire({
      title: `<span style="color:var(--color-primary);font-size:1.1rem">${sol.empresa}</span>`,
      html: `
        <div style="text-align:left;font-size:0.875rem;line-height:1.7;color:var(--color-title)">
          <p><strong>Código:</strong> <span style="font-family:monospace;font-weight:bold;color:var(--color-primary);background:var(--color-primary-light);padding:2px 6px;border-radius:4px">${sol.codigo || "—"}</span></p>
          <p><strong>Descripción:</strong> ${sol.descripcion}</p>
          <p><strong>Sede:</strong> ${getSedeLabel(sol.sede)}</p>
          <p><strong>Contratista:</strong> ${sol.nombreSolicitante}</p>
          <p><strong>Celular:</strong> ${sol.celular}</p>
          <p><strong>Correo:</strong> ${sol.correo}</p>
          <p><strong>Clasificación:</strong> ${sol.clasificacion === "TAR" ? "Alto riesgo (TAR)" : sol.clasificacion === "NO_TAR" ? "No alto riesgo" : "—"}</p>
          ${multiDocsHtml}
          <p style="margin-top:6px"><strong>Registrada:</strong> ${new Date(sol.fechaCreacion).toLocaleDateString("es-PE", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}</p>
          <p><strong>Creado por:</strong> ${sol.creadoPor}</p>
        </div>
      `,
      confirmButtonColor: "var(--color-primary)",
      confirmButtonText: "Cerrar",
      width: 520,
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
    <div className="flex flex-col">
      {/* ── Toolbar de Filtros y Búsqueda ── */}
      <div className="p-5 border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/50 flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Búsqueda por código / empresa / contratista */}
          <div className="md:col-span-4 flex flex-col gap-1">
            <label htmlFor="search-solicitud" className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
              <Hash size={13} /> Buscar por código o empresa
            </label>
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              <input
                id="search-solicitud"
                type="text"
                placeholder="Ej. SOL-2026-0001, Tech Corp..."
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all"
                value={searchCodigo}
                onChange={(e) => setSearchCodigo(e.target.value)}
              />
            </div>
          </div>

          {/* Filtro por Estado */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label htmlFor="filter-estado" className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
              <Filter size={13} /> Estado
            </label>
            <select
              id="filter-estado"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
            >
              <option value="TODOS">Todos los estados</option>
              <option value="Pendiente">Pendiente</option>
              <option value="Aprobada">Aprobada</option>
              <option value="Rechazada">Rechazada</option>
            </select>
          </div>

          {/* Filtro por Clasificación */}
          <div className="md:col-span-2 flex flex-col gap-1">
            <label htmlFor="filter-clasificacion" className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
              <Filter size={13} /> Clasificación
            </label>
            <select
              id="filter-clasificacion"
              className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] cursor-pointer"
              value={filtroClasificacion}
              onChange={(e) => setFiltroClasificacion(e.target.value)}
            >
              <option value="TODAS">Todas</option>
              <option value="TAR">Alto riesgo (TAR)</option>
              <option value="NO_TAR">No alto riesgo (No TAR)</option>
            </select>
          </div>

          {/* Rango de Fechas (Desde - Hasta) */}
          <div className="md:col-span-4 flex flex-col gap-1">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)] flex items-center gap-1">
              <Calendar size={13} /> Rango de fecha de registro
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                title="Fecha inicio"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-primary)]"
                value={fechaDesde}
                onChange={(e) => setFechaDesde(e.target.value)}
              />
              <span className="text-xs text-[var(--color-text-secondary)]">a</span>
              <input
                type="date"
                title="Fecha fin"
                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-[var(--color-border)] bg-white outline-none focus:border-[var(--color-primary)]"
                value={fechaHasta}
                onChange={(e) => setFechaHasta(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Barra de estado de filtros */}
        <div className="flex items-center justify-between pt-2 text-xs text-[var(--color-text-secondary)]">
          <span>
            Mostrando <strong>{filteredSolicitudes.length}</strong> de <strong>{solicitudes.length}</strong> solicitudes
            {hasActiveFilters && " (filtradas)"}
          </span>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-primary)] hover:underline cursor-pointer"
            >
              <RotateCcw size={13} />
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ── Tabla de Resultados ── */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--color-border)] bg-[var(--color-bg-soft)]/30">
              <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Hash size={13} /> Código</div>
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><Building2 size={13} /> Empresa</div>
              </th>
              <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                <div className="flex items-center gap-1.5"><User size={13} /> Contratista</div>
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
            {filteredSolicitudes.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center text-[var(--color-text-secondary)]">
                  <FileText size={32} className="mx-auto mb-2 opacity-30" />
                  <p className="font-semibold text-[var(--color-title)]">No se encontraron solicitudes</p>
                  <p className="text-xs mt-0.5">Prueba ajustando los términos de búsqueda o los filtros aplicados.</p>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleResetFilters}
                    className="w-auto text-xs mt-3 mx-auto"
                  >
                    <RotateCcw size={13} /> Restablecer filtros
                  </Button>
                </td>
              </tr>
            ) : (
              filteredSolicitudes.map((sol) => (
                <tr
                  key={sol.id}
                  className="border-b border-[var(--color-border)]/50 hover:bg-[var(--color-primary-light)]/30 transition-colors duration-100"
                >
                  <td className="px-4 py-3 font-mono text-xs font-bold text-[var(--color-primary)]">
                    {sol.codigo}
                  </td>
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
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

