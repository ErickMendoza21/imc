"use client";

import { useState, useEffect, useMemo } from "react";
import {
  MapPin,
  Plus,
  Search,
  Pencil,
  EyeOff,
  Eye,
  Hash,
  Calendar,
  Building2,
} from "lucide-react";
import Swal from "sweetalert2";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import {
  getSedes,
  saveSede,
  updateSede,
  toggleSedeActivo,
  type Sede,
} from "@/lib/services/sedes";
import { SedeFormModal } from "./SedeFormModal";

/** Badge de estado activo / inactivo */
function EstadoBadge({ activo }: { activo: boolean }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
        activo
          ? "bg-green-50 text-[var(--color-success)] border-[var(--color-success)]/20"
          : "bg-red-50 text-[var(--color-danger)] border-[var(--color-danger)]/20"
      }`}
    >
      {activo ? "Activo" : "Inactivo"}
    </span>
  );
}

export function SedesTable() {
  const [sedes, setSedes] = useState<Sede[]>([]);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [sedeToEdit, setSedeToEdit] = useState<Sede | null>(null);

  const loadSedes = () => {
    setSedes(getSedes(true));
  };

  useEffect(() => {
    loadSedes();
  }, []);

  const filteredSedes = useMemo(() => {
    if (!search.trim()) return sedes;
    const term = search.toLowerCase();
    return sedes.filter(
      (s) =>
        s.nombre.toLowerCase().includes(term) ||
        s.codigo.toLowerCase().includes(term) ||
        (s.direccion && s.direccion.toLowerCase().includes(term)) ||
        (s.descripcion && s.descripcion.toLowerCase().includes(term))
    );
  }, [sedes, search]);

  const handleToggleActivo = (sede: Sede) => {
    const accion = sede.activo ? "inhabilitar" : "habilitar";
    Swal.fire({
      icon: "warning",
      title: `¿${accion.charAt(0).toUpperCase() + accion.slice(1)} sede?`,
      text: `La sede "${sede.nombre}" será ${
        sede.activo ? "inhabilitada y no aparecerá como opción en nuevas solicitudes" : "habilitada nuevamente"
      }.`,
      showCancelButton: true,
      confirmButtonText: `Sí, ${accion}`,
      cancelButtonText: "Cancelar",
      confirmButtonColor: sede.activo
        ? "var(--color-danger)"
        : "var(--color-success)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        toggleSedeActivo(sede.id);
        loadSedes();
        Swal.fire({
          icon: "success",
          title: sede.activo ? "Sede inhabilitada" : "Sede habilitada",
          text: `"${sede.nombre}" ha sido ${
            sede.activo ? "inhabilitada" : "habilitada"
          }.`,
          confirmButtonColor: "var(--color-primary)",
        });
      }
    });
  };

  const handleCreate = () => {
    setSedeToEdit(null);
    setModalOpen(true);
  };

  const handleEdit = (sede: Sede) => {
    setSedeToEdit(sede);
    setModalOpen(true);
  };

  const handleSave = (data: { nombre: string; codigo: string; direccion?: string; descripcion?: string }) => {
    try {
      if (sedeToEdit) {
        updateSede(sedeToEdit.id, data);
        Swal.fire({
          icon: "success",
          title: "Sede actualizada",
          text: `La sede "${data.nombre}" ha sido actualizada con éxito.`,
          confirmButtonColor: "var(--color-primary)",
        });
      } else {
        saveSede(data);
        Swal.fire({
          icon: "success",
          title: "Sede registrada",
          text: `La sede "${data.nombre}" ha sido registrada con éxito.`,
          confirmButtonColor: "var(--color-primary)",
        });
      }
      setModalOpen(false);
      loadSedes();
    } catch (err: unknown) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: err instanceof Error ? err.message : "No se pudo guardar la sede.",
        confirmButtonColor: "var(--color-danger)",
      });
    }
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Encabezado ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-[var(--color-primary-light)] rounded-xl">
            <MapPin size={28} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-title)] leading-tight">
              Sedes
            </h1>
            <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
              Administra las sedes autorizadas para la atención de solicitudes y su disponibilidad.
            </p>
          </div>
        </div>

        <div className="max-w-fit">
          <Button type="button" variant="primary" onClick={handleCreate}>
            <Plus size={18} />
            Crear sede
          </Button>
        </div>
      </div>

      {/* ── Card de Tabla ── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
        {/* Buscador */}
        <div className="px-4 py-3 border-b border-[var(--color-border)]">
          <div className="max-w-sm">
            <Input
              type="text"
              placeholder="Buscar por nombre, código o dirección..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              prefix={<Search size={15} />}
            />
          </div>
        </div>

        {/* Tabla o estado vacío */}
        {filteredSedes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="p-4 bg-[var(--color-primary-light)] rounded-full mb-4">
              <MapPin size={40} className="text-[var(--color-primary)]" strokeWidth={1.5} />
            </div>
            <h2 className="text-lg font-bold text-[var(--color-title)] mb-1">
              {search.trim() ? "No se encontraron sedes" : "No hay sedes registradas"}
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] max-w-sm">
              {search.trim()
                ? "Intenta con otro término de búsqueda."
                : 'Crea una sede usando el botón "Crear sede".'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)]">
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Hash size={13} /> Código
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Building2 size={13} /> Nombre de la sede
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Dirección / Ubicación
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} /> Creado
                    </div>
                  </th>
                  <th className="px-4 py-3 font-semibold text-[var(--color-text-secondary)] text-xs uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredSedes.map((sede) => (
                  <tr
                    key={sede.id}
                    className={`
                      border-b border-[var(--color-border)]/50
                      transition-colors duration-100
                      ${sede.activo
                        ? "hover:bg-[var(--color-primary-light)]/30"
                        : "opacity-60 bg-[var(--color-bg-disabled)]/50"
                      }
                    `}
                  >
                    <td className="px-4 py-3 font-mono font-bold text-xs text-[var(--color-primary)]">
                      {sede.codigo}
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-title)]">
                      {sede.nombre}
                      {sede.descripcion && (
                        <p className="text-xs text-[var(--color-text-secondary)] line-clamp-1 font-normal mt-0.5">
                          {sede.descripcion}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {sede.direccion || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <EstadoBadge activo={sede.activo} />
                    </td>
                    <td className="px-4 py-3 text-[var(--color-text-secondary)]">
                      {new Date(sede.fechaCreacion).toLocaleDateString("es-PE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {/* Editar */}
                        <button
                          type="button"
                          onClick={() => handleEdit(sede)}
                          className="
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                            text-xs font-semibold
                            text-[var(--color-primary)] bg-[var(--color-primary-light)]
                            border border-[var(--color-primary)]/15
                            cursor-pointer transition-all duration-150
                            hover:bg-[var(--color-primary)] hover:text-white
                          "
                          aria-label={`Editar sede ${sede.nombre}`}
                        >
                          <Pencil size={13} />
                          Editar
                        </button>

                        {/* Inhabilitar / Habilitar */}
                        <button
                          type="button"
                          onClick={() => handleToggleActivo(sede)}
                          className={`
                            inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md
                            text-xs font-semibold
                            border cursor-pointer transition-all duration-150
                            ${
                              sede.activo
                                ? "text-[var(--color-danger)] bg-red-50 border-[var(--color-danger)]/15 hover:bg-[var(--color-danger)] hover:text-white"
                                : "text-[var(--color-success)] bg-green-50 border-[var(--color-success)]/15 hover:bg-[var(--color-success)] hover:text-white"
                            }
                          `}
                          aria-label={`${
                            sede.activo ? "Inhabilitar" : "Habilitar"
                          } sede ${sede.nombre}`}
                        >
                          {sede.activo ? (
                            <>
                              <EyeOff size={13} /> Inhabilitar
                            </>
                          ) : (
                            <>
                              <Eye size={13} /> Habilitar
                            </>
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {filteredSedes.length > 0 && (
          <div className="px-4 py-3 border-t border-[var(--color-border)] text-xs text-[var(--color-text-secondary)]">
            Mostrando {filteredSedes.length} de {sedes.length} sede{sedes.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Modal */}
      <SedeFormModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSedeToEdit(null);
        }}
        onSave={handleSave}
        sedeToEdit={sedeToEdit}
      />
    </div>
  );
}
