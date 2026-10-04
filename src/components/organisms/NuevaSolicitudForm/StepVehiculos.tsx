"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  Car, Upload, Trash2, UserPlus, Pencil, Search,
  CheckCircle2, X, Users,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Persona } from "./StepPersonal";
import { getSolicitudes } from "@/lib/services/solicitudes";
import {
  calcularFechaVencimiento,
  formatearFecha,
} from "@/lib/utils/vigencia";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface ConductorVehiculo {
  personaId: string;
  licenciaArchivoNombre: string;
  licenciaFechaVencimiento: string;
}

export interface Vehiculo {
  id: string;
  placa: string;
  marca: string;
  color: string;
  soatArchivoNombre: string;
  soatFechaEmision: string;
  citvArchivoNombre: string;
  citvFechaEmision: string;
  tarjetaPropiedadArchivoNombre: string;
  conductores: ConductorVehiculo[];
}

export interface StepVehiculosData {
  personal: Persona[];
  vehiculos: Vehiculo[];
}

interface StepVehiculosProps {
  data: StepVehiculosData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const VEHICULO_VACIO: Vehiculo = {
  id: "",
  placa: "",
  marca: "",
  color: "",
  soatArchivoNombre: "",
  soatFechaEmision: "",
  citvArchivoNombre: "",
  citvFechaEmision: "",
  tarjetaPropiedadArchivoNombre: "",
  conductores: [],
};

function buscarVehiculoPorPlaca(placa: string): Partial<Vehiculo> | null {
  if (typeof window === "undefined") return null;
  const solicitudes = getSolicitudes();
  for (const sol of solicitudes) {
    const v = (sol.vehiculos || []).find(
      (vh: any) => vh.placa?.toUpperCase() === placa.toUpperCase()
    );
    if (v) return { marca: v.marca || "", color: v.color || "" };
  }
  return null;
}

export function StepVehiculos({ data, setData }: StepVehiculosProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [vehiculo, setVehiculo] = useState<Vehiculo>(VEHICULO_VACIO);
  const [search, setSearch] = useState("");
  const [placaMsg, setPlacaMsg] = useState<{
    tipo: "found" | "new" | "dup";
    texto: string;
  } | null>(null);

  const personal = data.personal || [];
  const vehiculos = data.vehiculos || [];

  const isFormValid =
    vehiculo.placa.trim().length >= 6 &&
    placaMsg?.tipo !== "dup" &&
    vehiculo.soatArchivoNombre !== "" &&
    vehiculo.soatFechaEmision !== "" &&
    vehiculo.citvArchivoNombre !== "" &&
    vehiculo.citvFechaEmision !== "" &&
    vehiculo.tarjetaPropiedadArchivoNombre !== "" &&
    vehiculo.conductores.length > 0 &&
    vehiculo.conductores.every(
      (c) => c.licenciaArchivoNombre !== "" && c.licenciaFechaVencimiento !== ""
    );

  const handlePlacaChange = (val: string) => {
    const upper = val.toUpperCase().replace(/[^A-Z0-9-]/g, "");
    setVehiculo((prev) => ({ ...prev, placa: upper }));
    setPlacaMsg(null);
    if (upper.length >= 6) {
      const yaEnSolicitud = vehiculos.find(
        (v) => v.placa.toUpperCase() === upper && v.id !== vehiculo.id
      );
      if (yaEnSolicitud) {
        setPlacaMsg({ tipo: "dup", texto: "Esta placa ya está registrada en la solicitud." });
        return;
      }
      const existente = buscarVehiculoPorPlaca(upper);
      if (existente) {
        setVehiculo((prev) => ({
          ...prev,
          placa: upper,
          marca: existente.marca || prev.marca,
          color: existente.color || prev.color,
        }));
        setPlacaMsg({
          tipo: "found",
          texto: `Vehículo encontrado: ${existente.marca || ""}${existente.color ? ` – ${existente.color}` : ""}`,
        });
      } else {
        setPlacaMsg({ tipo: "new", texto: "Placa no encontrada. Ingresa los datos manualmente." });
      }
    }
  };

  const handleVehicleFile = (field: keyof Vehiculo, file: File | null) => {
    if (!file) return;
    setVehiculo((prev) => ({ ...prev, [field]: file.name }));
  };

  const handleToggleConductor = (personaId: string) => {
    setVehiculo((prev) => {
      const ya = prev.conductores.find((c) => c.personaId === personaId);
      if (ya) {
        return { ...prev, conductores: prev.conductores.filter((c) => c.personaId !== personaId) };
      }
      return {
        ...prev,
        conductores: [
          ...prev.conductores,
          { personaId, licenciaArchivoNombre: "", licenciaFechaVencimiento: "" },
        ],
      };
    });
  };

  const handleConductorDoc = (
    personaId: string,
    field: "licenciaArchivoNombre" | "licenciaFechaVencimiento",
    value: string
  ) => {
    setVehiculo((prev) => ({
      ...prev,
      conductores: prev.conductores.map((c) =>
        c.personaId === personaId ? { ...c, [field]: value } : c
      ),
    }));
  };

  const handleGuardar = () => {
    if (!isFormValid) return;
    setData((prev: any) => {
      const list = prev.vehiculos || [];
      const idx = list.findIndex((v: Vehiculo) => v.id === vehiculo.id);
      if (idx !== -1) {
        const updated = [...list];
        updated[idx] = vehiculo;
        return { ...prev, vehiculos: updated };
      }
      return { ...prev, vehiculos: [...list, { ...vehiculo, id: crypto.randomUUID() }] };
    });
    setVehiculo(VEHICULO_VACIO);
    setPlacaMsg(null);
    setIsAdding(false);
  };

  const handleEditar = (v: Vehiculo) => {
    setVehiculo(v);
    setPlacaMsg(null);
    setIsAdding(true);
  };

  const handleCancelar = () => {
    setVehiculo(VEHICULO_VACIO);
    setPlacaMsg(null);
    setIsAdding(false);
  };

  const handleEliminar = (id: string) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar este vehículo?",
      text: "Se perderá toda la información y documentos de este vehículo.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev: any) => ({
          ...prev,
          vehiculos: (prev.vehiculos || []).filter((v: Vehiculo) => v.id !== id),
        }));
      }
    });
  };

  const vehiculosFiltrados = vehiculos.filter(
    (v) =>
      v.placa.toLowerCase().includes(search.toLowerCase()) ||
      v.marca.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="px-8 py-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)]">Vehículos</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Registra los vehículos que ingresarán con la solicitud y asigna sus conductores.
          Los vehículos son <strong>opcionales</strong> — puedes continuar sin registrar ninguno.
        </p>
      </div>

      {/* Lista de vehículos registrados */}
      {vehiculos.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative w-full md:w-1/2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por placa o marca..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          {vehiculosFiltrados.map((v) => (
            <div
              key={v.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-[var(--color-primary)]">
                  <Car size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-title)]">
                    {v.placa}
                    {v.marca && (
                      <span className="ml-2 text-xs font-normal text-[var(--color-text-secondary)]">
                        {v.marca}{v.color ? ` · ${v.color}` : ""}
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {v.conductores.length === 0
                      ? "Sin conductores"
                      : `${v.conductores.length} conductor${v.conductores.length > 1 ? "es" : ""}: ${v.conductores
                          .map((c) => personal.find((p) => p.id === c.personaId)?.nombre || "—")
                          .join(", ")}`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  onClick={() => handleEditar(v)}
                >
                  <Pencil size={15} /> Editar
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
                  onClick={() => handleEliminar(v.id)}
                >
                  <Trash2 size={15} /> Eliminar
                </Button>
              </div>
            </div>
          ))}
          {vehiculosFiltrados.length === 0 && search && (
            <p className="text-sm text-center text-[var(--color-text-secondary)] py-4">
              No se encontraron vehículos con &ldquo;{search}&rdquo;
            </p>
          )}
        </div>
      )}

      {vehiculos.length === 0 && !isAdding && (
        <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-soft)]">
          <Car size={32} className="mx-auto mb-3 text-[var(--color-text-secondary)]/40" />
          <p className="text-[var(--color-text-secondary)] text-sm">
            No hay vehículos registrados. Si la solicitud no involucra vehículos, puedes continuar.
          </p>
        </div>
      )}

      {/* Formulario */}
      {isAdding ? (
        <div className="p-6 rounded-xl border border-[var(--color-secondary)]/30 bg-white shadow-md flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-[var(--color-primary)]">
              {vehiculo.id ? "Editar vehículo" : "Registrar vehículo"}
            </h3>
            <button
              type="button"
              onClick={handleCancelar}
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Datos del vehículo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Placa <span className="text-[var(--color-danger)]">*</span>
              </label>
              <Input
                placeholder="Ej. ABC-123"
                value={vehiculo.placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
              />
              {placaMsg && (
                <span className={`text-[11px] font-medium ${placaMsg.tipo === "found" ? "text-[var(--color-success)]" : placaMsg.tipo === "dup" ? "text-[var(--color-danger)]" : "text-amber-500"}`}>
                  {placaMsg.tipo === "found" ? "✓ " : "⚠ "}{placaMsg.texto}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Marca</label>
              <Input placeholder="Ej. Toyota" value={vehiculo.marca} onChange={(e) => setVehiculo((p) => ({ ...p, marca: e.target.value }))} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">Color</label>
              <Input placeholder="Ej. Blanco" value={vehiculo.color} onChange={(e) => setVehiculo((p) => ({ ...p, color: e.target.value }))} />
            </div>
          </div>

          {/* Documentos del vehículo */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Documentos del vehículo
            </span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* SOAT */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${vehiculo.soatArchivoNombre ? "border-[var(--color-success)]/40 bg-green-50/50" : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--color-title)]">SOAT <span className="text-[var(--color-danger)]">*</span></span>
                  <span className="text-[9px] font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)]/50 px-1.5 py-0.5 rounded">Vigencia: 1 año</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                  <Upload size={12} />
                  <span className="truncate max-w-[130px]">{vehiculo.soatArchivoNombre || "Cargar PDF"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleVehicleFile("soatArchivoNombre", e.target.files?.[0] || null)} />
                </label>
                <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-2">
                  <label className="text-[10px] font-semibold text-[var(--color-text-secondary)]">Fecha de emisión <span className="text-[var(--color-danger)]">*</span></label>
                  <Input type="date" className="h-8 text-xs" value={vehiculo.soatFechaEmision ?? ""} onChange={(e) => setVehiculo((p) => ({ ...p, soatFechaEmision: e.target.value }))} />
                  {vehiculo.soatFechaEmision && (
                    <span className="text-[10px] font-semibold text-[var(--color-danger)] text-right">
                      Vence: {formatearFecha(calcularFechaVencimiento(vehiculo.soatFechaEmision, 12))}
                    </span>
                  )}
                </div>
              </div>

              {/* CITV */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${vehiculo.citvArchivoNombre ? "border-[var(--color-success)]/40 bg-green-50/50" : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--color-title)]">Revisión Técnica (CITV) <span className="text-[var(--color-danger)]">*</span></span>
                  <span className="text-[9px] font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)]/50 px-1.5 py-0.5 rounded">Vigencia: 1 año</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                  <Upload size={12} />
                  <span className="truncate max-w-[130px]">{vehiculo.citvArchivoNombre || "Cargar PDF"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleVehicleFile("citvArchivoNombre", e.target.files?.[0] || null)} />
                </label>
                <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-2">
                  <label className="text-[10px] font-semibold text-[var(--color-text-secondary)]">Fecha de emisión <span className="text-[var(--color-danger)]">*</span></label>
                  <Input type="date" className="h-8 text-xs" value={vehiculo.citvFechaEmision ?? ""} onChange={(e) => setVehiculo((p) => ({ ...p, citvFechaEmision: e.target.value }))} />
                  {vehiculo.citvFechaEmision && (
                    <span className="text-[10px] font-semibold text-[var(--color-danger)] text-right">
                      Vence: {formatearFecha(calcularFechaVencimiento(vehiculo.citvFechaEmision, 12))}
                    </span>
                  )}
                </div>
              </div>

              {/* Tarjeta de Propiedad */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${vehiculo.tarjetaPropiedadArchivoNombre ? "border-[var(--color-success)]/40 bg-green-50/50" : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--color-title)]">Tarjeta de Propiedad <span className="text-[var(--color-danger)]">*</span></span>
                  <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">Sin vigencia</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                  <Upload size={12} />
                  <span className="truncate max-w-[130px]">{vehiculo.tarjetaPropiedadArchivoNombre || "Cargar PDF"}</span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleVehicleFile("tarjetaPropiedadArchivoNombre", e.target.files?.[0] || null)} />
                </label>
                {vehiculo.tarjetaPropiedadArchivoNombre && (
                  <span className="text-[10px] text-[var(--color-success)] font-medium">✓ {vehiculo.tarjetaPropiedadArchivoNombre}</span>
                )}
              </div>
            </div>
          </div>

          {/* Conductores */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)]">
            <div className="flex items-center gap-2">
              <Users size={16} className="text-[var(--color-primary)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                Conductores <span className="text-[var(--color-danger)]">*</span>
              </span>
              <span className="text-[10px] text-[var(--color-text-secondary)] ml-1">(selecciona del personal registrado en el Paso 3)</span>
            </div>

            {personal.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠ No hay personal registrado. Vuelve al Paso 3 para añadir trabajadores antes de asignar conductores.
              </p>
            ) : (
              <div className="flex flex-col gap-3">
                {personal.map((p) => {
                  const conductor = vehiculo.conductores.find((c) => c.personaId === p.id);
                  const isSelected = Boolean(conductor);
                  return (
                    <div key={p.id} className={`rounded-lg border transition-all ${isSelected ? "border-[var(--color-secondary)]/50 bg-[var(--color-primary-light)]/20" : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"}`}>
                      <label className="flex items-center gap-3 p-3 cursor-pointer">
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                          checked={isSelected}
                          onChange={() => handleToggleConductor(p.id)}
                        />
                        <div className="flex-1">
                          <span className="text-sm font-semibold text-[var(--color-title)]">{p.nombre}</span>
                          <span className="ml-2 text-xs text-[var(--color-text-secondary)]">({p.dni})</span>
                        </div>
                        {isSelected && (
                          <span className="text-[10px] font-semibold text-[var(--color-secondary)] bg-[var(--color-primary-light)] px-2 py-0.5 rounded">Conductor</span>
                        )}
                      </label>

                      {isSelected && (
                        <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]/50">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--color-text-secondary)] block mb-3">
                            Licencia de conducir
                          </span>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1.5">
                              <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-white text-xs font-medium text-[var(--color-primary)] transition-all">
                                <Upload size={13} />
                                <span className="truncate max-w-[160px]">{conductor?.licenciaArchivoNombre || "Subir licencia (PDF)"}</span>
                                <input
                                  type="file"
                                  accept=".pdf"
                                  className="hidden"
                                  onChange={(e) => {
                                    const f = e.target.files?.[0];
                                    if (f) handleConductorDoc(p.id, "licenciaArchivoNombre", f.name);
                                  }}
                                />
                              </label>
                              {conductor?.licenciaArchivoNombre && (
                                <span className="text-[10px] text-[var(--color-success)] font-medium">✓ {conductor.licenciaArchivoNombre}</span>
                              )}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              <label className="text-[10px] font-semibold text-[var(--color-text-secondary)]">
                                Fecha de caducidad de la licencia <span className="text-[var(--color-danger)]">*</span>
                              </label>
                              <Input
                                type="date"
                                className="h-8 text-xs"
                                value={conductor?.licenciaFechaVencimiento ?? ""}
                                onChange={(e) => handleConductorDoc(p.id, "licenciaFechaVencimiento", e.target.value)}
                              />
                              <span className="text-[9px] text-[var(--color-text-secondary)]">
                                Fecha impresa en la licencia (según categoría)
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                {vehiculo.conductores.length === 0 && (
                  <p className="text-xs font-bold text-[var(--color-danger)]">
                    Debes asignar al menos un conductor para este vehículo.
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {[vehiculo.soatArchivoNombre && vehiculo.soatFechaEmision, vehiculo.citvArchivoNombre && vehiculo.citvFechaEmision, vehiculo.tarjetaPropiedadArchivoNombre].filter(Boolean).length}/3 docs ·&nbsp;
              {vehiculo.conductores.filter((c) => c.licenciaArchivoNombre && c.licenciaFechaVencimiento).length}/{vehiculo.conductores.length} conductores completos
            </span>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={handleCancelar}>Cancelar</Button>
              <Button
                variant="primary"
                type="button"
                disabled={!isFormValid || placaMsg?.tipo === "dup"}
                onClick={handleGuardar}
              >
                <CheckCircle2 size={16} /> Guardar vehículo
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed border-2 py-6 text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]"
          onClick={() => setIsAdding(true)}
        >
          <UserPlus size={18} className="mr-2" />
          {vehiculos.length === 0 ? "Agregar vehículo" : "Agregar otro vehículo"}
        </Button>
      )}
    </section>
  );
}
