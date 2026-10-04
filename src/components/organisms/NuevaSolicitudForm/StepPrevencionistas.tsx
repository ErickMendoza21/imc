"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  Shield, Upload, Trash2, UserPlus, Pencil,
  CheckCircle2, X, HardHat, AlertCircle,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Persona } from "./StepPersonal";
import { TRABAJOS_ALTO_RIESGO_MOCK } from "@/lib/constants/solicitud";
import { calcularFechaVencimiento, formatearFecha } from "@/lib/utils/vigencia";

// ─── Tipos ────────────────────────────────────────────────────────────────────

export interface CertCapacitacionPrevencionista {
  tarId: string;         // ID del trabajo de alto riesgo
  archivoNombre: string;
  fechaEmision: string;
}

export interface Prevencionista {
  id: string;
  personaId: string;
  tarAsignados: string[];                                 // TAR que cubre este prevencionista
  formacionAcademicaArchivoNombre: string;               // Sin vigencia
  certificadoTrabajoArchivoNombre: string;               // Sin vigencia
  certsCapacitacion: CertCapacitacionPrevencionista[];   // 1 por cada TAR que cubre — 1 año
}

export interface StepPrevencionistasData {
  clasificacion: "TAR" | "NO_TAR" | "";
  serviciosSeleccionados?: string[];
  personal: Persona[];
  prevencionistas: Prevencionista[];
}

interface StepPrevencionistasProps {
  data: StepPrevencionistasData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

// ─── Estado vacío ─────────────────────────────────────────────────────────────

const PREVENCIONISTA_VACIO: Prevencionista = {
  id: "",
  personaId: "",
  tarAsignados: [],
  formacionAcademicaArchivoNombre: "",
  certificadoTrabajoArchivoNombre: "",
  certsCapacitacion: [],
};

// ─── Componente ───────────────────────────────────────────────────────────────

export function StepPrevencionistas({ data, setData }: StepPrevencionistasProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [prev, setPrev] = useState<Prevencionista>(PREVENCIONISTA_VACIO);

  const personal = data.personal || [];
  const prevencionistas = data.prevencionistas || [];
  const tarDisponibles = TRABAJOS_ALTO_RIESGO_MOCK.filter((t) =>
    (data.serviciosSeleccionados || []).includes(t.id)
  );

  // ─── Workers ya asignados como prevencionista (para evitar duplicados) ────────
  const personasYaAsignadas = new Set(
    prevencionistas
      .filter((p) => p.id !== prev.id) // excluir el que estamos editando
      .map((p) => p.personaId)
  );

  // ─── TAR no cubiertos por ningún prevencionista (para mostrar alerta) ─────────
  const tarCubiertos = new Set(prevencionistas.flatMap((p) => p.tarAsignados));
  const tarSinCubrir = tarDisponibles.filter((t) => !tarCubiertos.has(t.id));

  // ─── Validación del formulario ────────────────────────────────────────────────
  const isFormValid =
    prev.personaId !== "" &&
    prev.tarAsignados.length > 0 &&
    prev.formacionAcademicaArchivoNombre !== "" &&
    prev.certificadoTrabajoArchivoNombre !== "" &&
    prev.certsCapacitacion.length === prev.tarAsignados.length &&
    prev.certsCapacitacion.every((c) => c.archivoNombre !== "" && c.fechaEmision !== "");

  // ─── Toggle TAR asignado ──────────────────────────────────────────────────────
  const handleToggleTar = (tarId: string) => {
    setPrev((p) => {
      const ya = p.tarAsignados.includes(tarId);
      const nextTars = ya
        ? p.tarAsignados.filter((id) => id !== tarId)
        : [...p.tarAsignados, tarId];

      // Sincronizar certsCapacitacion: agregar/quitar según nextTars
      const nextCerts = nextTars.map((tid) => {
        const existing = p.certsCapacitacion.find((c) => c.tarId === tid);
        return existing ?? { tarId: tid, archivoNombre: "", fechaEmision: "" };
      });

      return { ...p, tarAsignados: nextTars, certsCapacitacion: nextCerts };
    });
  };

  // ─── Docs generales del prevencionista ────────────────────────────────────────
  const handleDocFile = (
    field: "formacionAcademicaArchivoNombre" | "certificadoTrabajoArchivoNombre",
    file: File | null
  ) => {
    if (!file) return;
    setPrev((p) => ({ ...p, [field]: file.name }));
  };

  // ─── Certificado de capacitación por TAR ─────────────────────────────────────
  const handleCertFile = (tarId: string, file: File | null) => {
    if (!file) return;
    setPrev((p) => ({
      ...p,
      certsCapacitacion: p.certsCapacitacion.map((c) =>
        c.tarId === tarId ? { ...c, archivoNombre: file.name } : c
      ),
    }));
  };

  const handleCertFecha = (tarId: string, fecha: string) => {
    setPrev((p) => ({
      ...p,
      certsCapacitacion: p.certsCapacitacion.map((c) =>
        c.tarId === tarId ? { ...c, fechaEmision: fecha } : c
      ),
    }));
  };

  // ─── Guardar ──────────────────────────────────────────────────────────────────
  const handleGuardar = () => {
    if (!isFormValid) return;
    setData((state: any) => {
      const list = state.prevencionistas || [];
      const idx = list.findIndex((item: Prevencionista) => item.id === prev.id);
      if (idx !== -1) {
        const updated = [...list];
        updated[idx] = prev;
        return { ...state, prevencionistas: updated };
      }
      return {
        ...state,
        prevencionistas: [...list, { ...prev, id: crypto.randomUUID() }],
      };
    });
    setPrev(PREVENCIONISTA_VACIO);
    setIsAdding(false);
  };

  // ─── Editar ───────────────────────────────────────────────────────────────────
  const handleEditar = (item: Prevencionista) => {
    setPrev(item);
    setIsAdding(true);
  };

  // ─── Cancelar ─────────────────────────────────────────────────────────────────
  const handleCancelar = () => {
    setPrev(PREVENCIONISTA_VACIO);
    setIsAdding(false);
  };

  // ─── Eliminar ─────────────────────────────────────────────────────────────────
  const handleEliminar = (id: string) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar este prevencionista?",
      text: "Se perderán sus documentos y asignaciones.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((state: any) => ({
          ...state,
          prevencionistas: (state.prevencionistas || []).filter(
            (item: Prevencionista) => item.id !== id
          ),
        }));
      }
    });
  };

  const getPersona = (id: string) => personal.find((p) => p.id === id);

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <section className="px-8 py-6 flex flex-col gap-5">
      {/* Encabezado */}
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)] flex items-center gap-2">
          <Shield size={20} className="text-[var(--color-secondary)]" />
          Prevencionistas
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Designa al prevencionista o prevencionistas que cubrirán los trabajos de alto riesgo de esta solicitud.
          Cada uno puede cubrir uno o varios trabajos; si cubre varios, se le solicitará un certificado de capacitación por cada uno.
        </p>
      </div>

      {/* Alerta de TAR sin cubrir */}
      {prevencionistas.length > 0 && tarSinCubrir.length > 0 && (
        <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          <AlertCircle size={15} className="mt-0.5 shrink-0" />
          <span>
            <strong>Trabajos sin prevencionista asignado:</strong>{" "}
            {tarSinCubrir.map((t) => t.label).join(", ")}
          </span>
        </div>
      )}

      {/* Lista de prevencionistas registrados */}
      {prevencionistas.length > 0 && (
        <div className="flex flex-col gap-3">
          {prevencionistas.map((item) => {
            const persona = getPersona(item.personaId);
            return (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] shadow-sm"
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white rounded-full text-[var(--color-secondary)]">
                    <HardHat size={22} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[var(--color-title)]">
                      {persona?.nombre ?? "—"}
                      <span className="ml-2 text-xs font-normal text-[var(--color-text-secondary)]">
                        DNI: {persona?.dni ?? "—"}
                      </span>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {item.tarAsignados.map((tarId) => {
                        const t = TRABAJOS_ALTO_RIESGO_MOCK.find((x) => x.id === tarId);
                        return t ? (
                          <span
                            key={tarId}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-secondary)]/10 text-[var(--color-secondary)]"
                          >
                            {t.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    type="button"
                    className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                    onClick={() => handleEditar(item)}
                  >
                    <Pencil size={15} /> Editar
                  </Button>
                  <Button
                    variant="outline"
                    type="button"
                    className="text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white"
                    onClick={() => handleEliminar(item.id)}
                  >
                    <Trash2 size={15} /> Eliminar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {prevencionistas.length === 0 && !isAdding && (
        <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-soft)]">
          <HardHat size={32} className="mx-auto mb-3 text-[var(--color-text-secondary)]/40" />
          <p className="text-[var(--color-text-secondary)] text-sm">
            Agrega al menos un prevencionista para poder enviar la solicitud.
          </p>
        </div>
      )}

      {/* ── Formulario ── */}
      {isAdding ? (
        <div className="p-6 rounded-xl border border-[var(--color-secondary)]/30 bg-white shadow-md flex flex-col gap-6">
          {/* Cabecera */}
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-[var(--color-primary)]">
              {prev.id ? "Editar prevencionista" : "Añadir prevencionista"}
            </h3>
            <button
              type="button"
              onClick={handleCancelar}
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors border-none bg-transparent cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── Selección de trabajador ── */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Trabajador designado como prevencionista <span className="text-[var(--color-danger)]">*</span>
            </label>
            {personal.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-3">
                ⚠ No hay personal registrado. Vuelve al Paso 3 para añadir trabajadores primero.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {personal.map((p) => {
                  const selected = prev.personaId === p.id;
                  const yaAsignado = personasYaAsignadas.has(p.id);
                  return (
                    <label
                      key={p.id}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                        yaAsignado && !selected
                          ? "opacity-40 cursor-not-allowed border-[var(--color-border)] bg-gray-50"
                          : selected
                          ? "border-[var(--color-secondary)] bg-[var(--color-primary-light)]/30 ring-1 ring-[var(--color-secondary)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-secondary)]/40"
                      }`}
                    >
                      <input
                        type="radio"
                        name="prevencionista_persona"
                        className="accent-[var(--color-secondary)] cursor-pointer"
                        checked={selected}
                        disabled={yaAsignado && !selected}
                        onChange={() =>
                          setPrev((state) => ({ ...state, personaId: p.id }))
                        }
                      />
                      <div>
                        <span className="text-xs font-semibold text-[var(--color-title)] block">{p.nombre}</span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">DNI: {p.dni}</span>
                        {yaAsignado && !selected && (
                          <span className="text-[9px] text-amber-500 block">Ya asignado</span>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Trabajos TAR a cubrir ── */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--color-border)]">
            <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
              Trabajos de alto riesgo que cubrirá <span className="text-[var(--color-danger)]">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {tarDisponibles.map((t) => {
                const checked = prev.tarAsignados.includes(t.id);
                return (
                  <label
                    key={t.id}
                    className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                      checked
                        ? "border-[var(--color-secondary)] bg-[var(--color-primary-light)]/30 ring-1 ring-[var(--color-secondary)]"
                        : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-secondary)]/40"
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                      checked={checked}
                      onChange={() => handleToggleTar(t.id)}
                    />
                    <span className="text-xs font-semibold text-[var(--color-title)] leading-tight">{t.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* ── Documentos generales ── */}
          <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Documentos del prevencionista
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Formación académica */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${prev.formacionAcademicaArchivoNombre ? "border-[var(--color-success)]/40 bg-green-50/50" : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--color-title)]">
                    Formación académica (bachiller / título técnico) <span className="text-[var(--color-danger)]">*</span>
                  </span>
                  <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Sin vigencia</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1.5 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                  <Upload size={12} />
                  <span className="truncate max-w-[200px]">
                    {prev.formacionAcademicaArchivoNombre || "Cargar PDF"}
                  </span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleDocFile("formacionAcademicaArchivoNombre", e.target.files?.[0] || null)} />
                </label>
                {prev.formacionAcademicaArchivoNombre && (
                  <span className="text-[10px] text-[var(--color-success)] font-medium">✓ {prev.formacionAcademicaArchivoNombre}</span>
                )}
              </div>

              {/* Certificados de trabajo */}
              <div className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${prev.certificadoTrabajoArchivoNombre ? "border-[var(--color-success)]/40 bg-green-50/50" : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"}`}>
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold text-[var(--color-title)]">
                    Certificados de trabajo <span className="text-[var(--color-danger)]">*</span>
                  </span>
                  <span className="text-[9px] font-medium text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded shrink-0">Sin vigencia</span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1.5 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                  <Upload size={12} />
                  <span className="truncate max-w-[200px]">
                    {prev.certificadoTrabajoArchivoNombre || "Cargar PDF"}
                  </span>
                  <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleDocFile("certificadoTrabajoArchivoNombre", e.target.files?.[0] || null)} />
                </label>
                {prev.certificadoTrabajoArchivoNombre && (
                  <span className="text-[10px] text-[var(--color-success)] font-medium">✓ {prev.certificadoTrabajoArchivoNombre}</span>
                )}
              </div>
            </div>
          </div>

          {/* ── Certificados de capacitación por TAR ── */}
          {prev.tarAsignados.length > 0 && (
            <div className="flex flex-col gap-3 pt-4 border-t border-[var(--color-border)]">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-secondary)]">
                  Certificados de capacitación por trabajo de alto riesgo
                </span>
                <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                  Se requiere un certificado por cada trabajo que cubrirá este prevencionista.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {prev.certsCapacitacion.map((cert) => {
                  const tar = TRABAJOS_ALTO_RIESGO_MOCK.find((t) => t.id === cert.tarId);
                  return (
                    <div
                      key={cert.tarId}
                      className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${cert.archivoNombre && cert.fechaEmision ? "border-[var(--color-success)]/40 bg-green-50/50" : "border-[var(--color-secondary)]/30 bg-[var(--color-primary-light)]/10"}`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-semibold text-[var(--color-title)] leading-tight">
                          Cert. capacitación: {tar?.label ?? cert.tarId}
                          <span className="text-[var(--color-danger)] ml-0.5">*</span>
                        </span>
                        <span className="text-[9px] font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)]/50 px-1.5 py-0.5 rounded shrink-0">Vigencia: 1 año</span>
                      </div>
                      <label className="cursor-pointer inline-flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                        <Upload size={12} />
                        <span className="truncate max-w-[180px]">{cert.archivoNombre || "Cargar PDF"}</span>
                        <input type="file" accept=".pdf" className="hidden" onChange={(e) => handleCertFile(cert.tarId, e.target.files?.[0] || null)} />
                      </label>
                      {cert.archivoNombre && (
                        <span className="text-[10px] text-[var(--color-success)] font-medium">✓ {cert.archivoNombre}</span>
                      )}
                      {/* Fecha de emisión */}
                      <div className="flex flex-col gap-1 border-t border-[var(--color-border)] pt-2">
                        <label className="text-[10px] font-semibold text-[var(--color-text-secondary)]">
                          Fecha de emisión <span className="text-[var(--color-danger)]">*</span>
                        </label>
                        <Input
                          type="date"
                          className="h-8 text-xs"
                          value={cert.fechaEmision ?? ""}
                          onChange={(e) => handleCertFecha(cert.tarId, e.target.value)}
                        />
                        {cert.fechaEmision && (
                          <span className="text-[10px] font-semibold text-[var(--color-danger)] text-right">
                            Vence: {formatearFecha(calcularFechaVencimiento(cert.fechaEmision, 12))}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {prev.certsCapacitacion.filter((c) => c.archivoNombre && c.fechaEmision).length}/{prev.tarAsignados.length} certificados de capacitación completos
            </span>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="button"
                disabled={!isFormValid}
                onClick={handleGuardar}
              >
                <CheckCircle2 size={16} />
                Guardar prevencionista
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
          {prevencionistas.length === 0 ? "Añadir prevencionista" : "Añadir otro prevencionista"}
        </Button>
      )}
    </section>
  );
}
