"use client";

import { useState } from "react";
import Swal from "sweetalert2";
import {
  Users, Upload, Trash2, UserPlus, Pencil, Search,
  CheckCircle2, ShieldAlert, X, Calendar,
} from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { getSolicitudes } from "@/lib/services/solicitudes";
import { TRABAJOS_ALTO_RIESGO_MOCK } from "@/lib/constants/solicitud";
import {
  VIGENCIA_DOCS,
  calcularFechaVencimiento,
  formatearFecha,
  vigenciaLabel,
  type Vigencia,
} from "@/lib/utils/vigencia";

// ─── Tipos ───────────────────────────────────────────────────────────────────

export interface DocumentoPersona {
  archivoNombre: string;
  fechaEmision: string;
}

export interface Persona {
  id: string;
  dni: string;
  nombre: string;
  tarAsignados: string[];          // IDs de trabajos TAR que hará esta persona
  documentos: Record<string, DocumentoPersona>;
}

export interface StepPersonalData {
  clasificacion: "TAR" | "NO_TAR" | "";
  serviciosSeleccionados?: string[];
  casosEspecialesSeleccionados?: string[];
  personal: Persona[];
}

interface StepPersonalProps {
  data: StepPersonalData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

// ─── Tipos de doc ────────────────────────────────────────────────────────────

interface DocDef {
  id: string;
  label: string;
  conFecha: boolean;
  vigencia?: Vigencia;
}

// ─── Docs base (todos los trabajadores) ──────────────────────────────────────

const DOCS_BASE: DocDef[] = [
  { id: "induccion_sig", label: "Inducción SIG",                                  conFecha: true,  vigencia: 12 },
  { id: "camo",         label: "CAMO (Certificado de Aptitud Médica Ocupacional)", conFecha: true,  vigencia: 24 },
  { id: "risst",        label: "Cargo de entrega de RISST",                        conFecha: true,  vigencia: 12 },
];

const DOCS_TAR_BASE: DocDef[] = [
  { id: "prevencionista", label: "Prevencionista / SSOMA",       conFecha: false },
  { id: "registro_epp",   label: "Registro de entrega de EPP",   conFecha: false, vigencia: null },
];

const DOCS_ALTURA: DocDef[] = [
  { id: "test_medico_altura",       label: "Test médico de altura (CAMO)",          conFecha: true, vigencia: 12 },
  { id: "cert_capacitacion_altura", label: "Certificado de capacitación en altura", conFecha: true, vigencia: 12 },
];

const DOCS_PLATAFORMA: DocDef[] = [
  { id: "cert_operador_plataforma", label: "Certificado de operador de la plataforma", conFecha: true, vigencia: 12 },
];

// ─── Helper: docs requeridos para esta persona ────────────────────────────────

function getDocsRequeridos(
  isTar: boolean,
  tarAsignados: string[],
  casosEspecialesSeleccionados: string[]
): DocDef[] {
  // Para TAR el CAMO general se valida en 1 año (más restrictivo)
  const camoDoc: DocDef = {
    id: "camo",
    label: "CAMO (Certificado de Aptitud Médica Ocupacional)",
    conFecha: true,
    vigencia: isTar ? 12 : 24,
  };

  const docs: DocDef[] = [
    { id: "induccion_sig", label: "Inducción SIG",            conFecha: true, vigencia: 12 },
    camoDoc,
    { id: "risst", label: "Cargo de entrega de RISST",        conFecha: true, vigencia: 12 },
  ];

  if (isTar) {
    docs.push(...DOCS_TAR_BASE);
    if (tarAsignados.includes("altura")) {
      docs.push(...DOCS_ALTURA);
      if (casosEspecialesSeleccionados.includes("altura_plataforma")) {
        docs.push(...DOCS_PLATAFORMA);
      }
    }
  }
  return docs;
}

// ─── Helper: buscar trabajador en solicitudes pasadas ─────────────────────────

function buscarTrabajadorPorDNI(dni: string): { nombre: string } | null {
  if (typeof window === "undefined") return null;
  const solicitudes = getSolicitudes();
  for (const sol of solicitudes) {
    const encontrado = (sol.personal || []).find(
      (p: any) => p.dni === dni
    );
    if (encontrado) {
      return { nombre: encontrado.nombre };
    }
  }
  return null;
}

// ─── Estado vacío para un nuevo registro ─────────────────────────────────────

const PERSONA_VACIA: Persona = {
  id: "",
  dni: "",
  nombre: "",
  tarAsignados: [],
  documentos: {},
};

// ─── Componente principal ─────────────────────────────────────────────────────

export function StepPersonal({ data, setData }: StepPersonalProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [persona, setPersona] = useState<Persona>(PERSONA_VACIA);
  const [searchPersonal, setSearchPersonal] = useState("");
  const [dniMsg, setDniMsg] = useState<{ tipo: "found" | "new" | "dup"; texto: string } | null>(null);

  const isTar = data.clasificacion === "TAR";
  const serviciosDisponibles = (data.serviciosSeleccionados || []);
  const casosEspeciales = (data.casosEspecialesSeleccionados || []);

  // Docs requeridos según asignaciones de esta persona
  const docsRequeridos = getDocsRequeridos(isTar, persona.tarAsignados, casosEspeciales);

  // ── Validación del formulario ──
  const isFormValid =
    persona.dni.length === 8 &&
    /^\d+$/.test(persona.dni) &&
    persona.nombre.trim() !== "" &&
    docsRequeridos.every((doc) => persona.documentos[doc.id]?.archivoNombre);

  // ── Buscar DNI en solicitudes previas ──
  const handleDniChange = (val: string) => {
    if (val !== "" && (!/^\d+$/.test(val) || val.length > 8)) return;
    setPersona((prev) => ({ ...prev, dni: val, nombre: prev.id ? prev.nombre : "" }));
    setDniMsg(null);

    if (val.length === 8) {
      // ¿Ya está en esta solicitud?
      const yaEnSolicitud = (data.personal || []).find(
        (p) => p.dni === val && p.id !== persona.id
      );
      if (yaEnSolicitud) {
        setDniMsg({ tipo: "dup", texto: "Este DNI ya fue registrado en esta solicitud." });
        return;
      }
      // Buscar en solicitudes anteriores
      const encontrado = buscarTrabajadorPorDNI(val);
      if (encontrado) {
        setPersona((prev) => ({ ...prev, dni: val, nombre: encontrado.nombre }));
        setDniMsg({ tipo: "found", texto: `Trabajador encontrado: ${encontrado.nombre}` });
      } else {
        setDniMsg({ tipo: "new", texto: "DNI no encontrado. Ingresa el nombre manualmente." });
      }
    }
  };

  // ── Toggle de TAR asignado ──
  const handleToggleTar = (tarId: string) => {
    setPersona((prev) => {
      const current = prev.tarAsignados;
      const next = current.includes(tarId)
        ? current.filter((id) => id !== tarId)
        : [...current, tarId];
      return { ...prev, tarAsignados: next };
    });
  };

  // ── Manejo de archivos por documento ──
  const handleFileChange = (docId: string, file: File | null) => {
    if (!file) return;
    setPersona((prev) => ({
      ...prev,
      documentos: {
        ...prev.documentos,
        [docId]: { archivoNombre: file.name, fechaEmision: prev.documentos[docId]?.fechaEmision ?? "" },
      },
    }));
  };

  const handleFechaChange = (docId: string, fecha: string) => {
    setPersona((prev) => ({
      ...prev,
      documentos: {
        ...prev.documentos,
        [docId]: { archivoNombre: prev.documentos[docId]?.archivoNombre ?? "", fechaEmision: fecha },
      },
    }));
  };

  // ── Guardar persona ──
  const handleGuardar = () => {
    if (!isFormValid) return;
    setData((prev: any) => {
      const personal = prev.personal || [];
      const existingIndex = personal.findIndex((p: Persona) => p.id === persona.id);
      if (existingIndex !== -1) {
        const updated = [...personal];
        updated[existingIndex] = persona;
        return { ...prev, personal: updated };
      }
      return {
        ...prev,
        personal: [...personal, { ...persona, id: crypto.randomUUID() }],
      };
    });
    setPersona(PERSONA_VACIA);
    setDniMsg(null);
    setIsAdding(false);
  };

  // ── Editar persona existente ──
  const handleEditar = (p: Persona) => {
    setPersona(p);
    setDniMsg(null);
    setIsAdding(true);
  };

  // ── Cancelar ──
  const handleCancelar = () => {
    setPersona(PERSONA_VACIA);
    setDniMsg(null);
    setIsAdding(false);
  };

  // ── Eliminar persona ──
  const handleEliminar = (id: string) => {
    Swal.fire({
      icon: "warning",
      title: "¿Eliminar a este personal?",
      text: "No podrás revertir esta acción.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        setData((prev: any) => {
          const newPersonal = (prev.personal || []).filter((p: Persona) => p.id !== id);
          const newCargaMasiva = { ...prev.cargaMasiva };
          Object.keys(newCargaMasiva).forEach((docId) => {
            newCargaMasiva[docId] = {
              ...newCargaMasiva[docId],
              personalIds: (newCargaMasiva[docId].personalIds || []).filter(
                (pId: string) => pId !== id
              ),
            };
          });
          return { ...prev, personal: newPersonal, cargaMasiva: newCargaMasiva };
        });
      }
    });
  };

  // ── Trabajos TAR disponibles en la solicitud (para mostrar los checkboxes) ──
  const tarDisponibles = TRABAJOS_ALTO_RIESGO_MOCK.filter((t) =>
    serviciosDisponibles.includes(t.id)
  );

  // ── Lista filtrada ──
  const personalFiltrado = (data.personal || []).filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchPersonal.toLowerCase()) ||
      p.dni.includes(searchPersonal)
  );

  // ── Renderizado de un grupo de documentos ──
  const renderGrupoDocumentos = (
    titulo: string,
    docs: typeof DOCS_BASE,
    color: string = "var(--color-primary)"
  ) => (
    <div className="flex flex-col gap-2">
      <span
        className="text-[11px] font-bold uppercase tracking-wider"
        style={{ color }}
      >
        {titulo}
      </span>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {docs.map((doc) => {
          const docData = persona.documentos[doc.id];
          return (
            <div
              key={doc.id}
              className={`flex flex-col gap-2 p-3 rounded-lg border transition-colors ${
                docData?.archivoNombre
                  ? "border-[var(--color-success)]/40 bg-green-50/50"
                  : "border-[var(--color-border)] bg-[var(--color-bg-soft)]"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <span
                  className="text-xs font-medium text-[var(--color-title)] leading-tight flex-1"
                  title={doc.label}
                >
                  {doc.label}
                  <span className="text-[var(--color-danger)] ml-0.5">*</span>
                </span>
                <label className="cursor-pointer shrink-0 inline-flex items-center gap-1.5 px-2 py-1 rounded border border-[var(--color-border)] bg-white hover:bg-[var(--color-primary-light)] text-xs font-medium text-[var(--color-primary)] transition-colors">
                  <Upload size={12} />
                  {docData?.archivoNombre ? "Cambiar" : "Cargar"}
                  <input
                    type="file"
                    accept=".pdf"
                    className="hidden"
                    onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              {docData?.archivoNombre && (
                <span className="text-[10px] font-medium text-[var(--color-success)] truncate" title={docData.archivoNombre}>
                  ✓ {docData.archivoNombre}
                </span>
              )}

              {/* Fecha de emisión para certificados */}
              {doc.conFecha && (
                <div className="flex flex-col gap-1 mt-1 border-t border-[var(--color-border)] pt-2">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-semibold text-[var(--color-text-secondary)]">
                      Fecha de emisión <span className="text-[var(--color-danger)]">*</span>
                    </label>
                    {doc.vigencia !== undefined && (
                      <span className="text-[9px] font-medium text-[var(--color-primary)] bg-[var(--color-primary-light)]/50 px-1.5 py-0.5 rounded">
                        Vigencia: {vigenciaLabel(doc.vigencia)}
                      </span>
                    )}
                  </div>
                  <Input
                    type="date"
                    className="h-8 text-xs"
                    value={docData?.fechaEmision ?? ""}
                    onChange={(e) => handleFechaChange(doc.id, e.target.value)}
                  />
                  {doc.vigencia && typeof doc.vigencia === "number" && docData?.fechaEmision && (
                    <span className="text-[10px] font-semibold text-[var(--color-danger)] text-right">
                      Vence: {formatearFecha(calcularFechaVencimiento(docData.fechaEmision, doc.vigencia))}
                    </span>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <section className="px-8 py-6 flex flex-col gap-5">
      {/* ── Encabezado ── */}
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)]">
          Personal Asignado {isTar ? "(TAR)" : "(No TAR)"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Registra al personal que realizará el trabajo. Mínimo 1 trabajador para continuar.
        </p>
      </div>

      {/* ── Lista de personal existente ── */}
      {(data.personal || []).length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="relative w-full md:w-1/2">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar por nombre o DNI..."
              value={searchPersonal}
              onChange={(e) => setSearchPersonal(e.target.value)}
            />
          </div>

          {personalFiltrado.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-soft)] shadow-sm"
            >
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-full text-[var(--color-primary)]">
                  <Users size={22} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[var(--color-title)]">{p.nombre}</p>
                  <p className="text-xs text-[var(--color-text-secondary)]">DNI: {p.dni}</p>
                  {isTar && p.tarAsignados && p.tarAsignados.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {p.tarAsignados.map((tId) => {
                        const t = TRABAJOS_ALTO_RIESGO_MOCK.find((x) => x.id === tId);
                        return t ? (
                          <span
                            key={tId}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[var(--color-primary-light)] text-[var(--color-primary)]"
                          >
                            <ShieldAlert size={9} />
                            {t.label}
                          </span>
                        ) : null;
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  type="button"
                  className="text-[var(--color-primary)] border-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white transition-colors"
                  onClick={() => handleEditar(p)}
                >
                  <Pencil size={15} />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  type="button"
                  className="text-[var(--color-danger)] border-[var(--color-danger)] hover:bg-[var(--color-danger)] hover:text-white transition-colors"
                  onClick={() => handleEliminar(p.id)}
                >
                  <Trash2 size={15} />
                  Eliminar
                </Button>
              </div>
            </div>
          ))}

          {personalFiltrado.length === 0 && searchPersonal && (
            <p className="text-sm text-[var(--color-text-secondary)] text-center py-4">
              No se encontró personal con &ldquo;{searchPersonal}&rdquo;
            </p>
          )}
        </div>
      )}

      {(data.personal || []).length === 0 && !isAdding && (
        <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-soft)]">
          <Users size={32} className="mx-auto mb-3 text-[var(--color-text-secondary)]/40" />
          <p className="text-[var(--color-text-secondary)] text-sm">
            No hay personal añadido todavía. Agrega al menos un trabajador para continuar.
          </p>
        </div>
      )}

      {/* ── Formulario de nuevo / edición ── */}
      {isAdding ? (
        <div className="p-6 rounded-xl border border-[var(--color-secondary)]/30 bg-white shadow-md flex flex-col gap-6">
          {/* Cabecera del form */}
          <div className="flex items-center justify-between">
            <h3 className="text-md font-bold text-[var(--color-primary)]">
              {persona.id ? "Editar trabajador" : "Registrar trabajador"}
            </h3>
            <button
              type="button"
              onClick={handleCancelar}
              className="p-1.5 rounded-lg text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)] transition-colors border-none bg-transparent cursor-pointer"
              aria-label="Cerrar"
            >
              <X size={18} />
            </button>
          </div>

          {/* ── DNI + Nombre ── */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                DNI <span className="text-[var(--color-danger)]">*</span>
              </label>
              <Input
                placeholder="Ej. 12345678"
                value={persona.dni}
                onChange={(e) => handleDniChange(e.target.value)}
              />
              {dniMsg && (
                <span
                  className={`text-[11px] font-medium ${
                    dniMsg.tipo === "found"
                      ? "text-[var(--color-success)]"
                      : dniMsg.tipo === "dup"
                      ? "text-[var(--color-danger)]"
                      : "text-[var(--color-warning)]"
                  }`}
                >
                  {dniMsg.tipo === "found" ? "✓ " : "⚠ "}
                  {dniMsg.texto}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Nombre Completo <span className="text-[var(--color-danger)]">*</span>
              </label>
              <Input
                placeholder="Ej. Juan Pérez"
                value={persona.nombre}
                onChange={(e) => setPersona((prev) => ({ ...prev, nombre: e.target.value }))}
              />
            </div>
          </div>

          {/* ── Trabajos TAR asignados (solo si es TAR y hay servicios seleccionados) ── */}
          {isTar && tarDisponibles.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                Trabajos de Alto Riesgo que realizará esta persona
              </label>
              <div className="grid grid-cols-2 gap-2">
                {tarDisponibles.map((tar) => {
                  const checked = persona.tarAsignados.includes(tar.id);
                  return (
                    <label
                      key={tar.id}
                      className={`flex items-center gap-2.5 p-3 rounded-lg border cursor-pointer transition-all select-none ${
                        checked
                          ? "border-[var(--color-secondary)] bg-[var(--color-primary-light)]/40 ring-1 ring-[var(--color-secondary)]"
                          : "border-[var(--color-border)] bg-[var(--color-bg-soft)] hover:border-[var(--color-secondary)]/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-[var(--color-secondary)] cursor-pointer"
                        checked={checked}
                        onChange={() => handleToggleTar(tar.id)}
                      />
                      <span className="text-xs font-semibold text-[var(--color-title)] leading-tight">
                        {tar.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Documentos ── */}
          <div className="flex flex-col gap-5 pt-2 border-t border-[var(--color-border)]">
            <span className="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-wider">
              Documentos obligatorios
            </span>

            {/* Base */}
            {renderGrupoDocumentos("Documentos base", DOCS_BASE)}

            {/* TAR base */}
            {isTar && renderGrupoDocumentos(
              "Documentos TAR",
              DOCS_TAR_BASE,
              "var(--color-secondary)"
            )}

            {/* Documentos de Altura */}
            {isTar && persona.tarAsignados.includes("altura") && (
              <>
                {renderGrupoDocumentos(
                  "Trabajos en Altura",
                  DOCS_ALTURA,
                  "var(--color-warning)"
                )}
                {/* Plataforma elevadora */}
                {casosEspeciales.includes("altura_plataforma") &&
                  renderGrupoDocumentos(
                    "Caso Especial: Plataforma Elevadora",
                    DOCS_PLATAFORMA,
                    "var(--color-warning)"
                  )}
              </>
            )}
          </div>

          {/* ── Footer del formulario ── */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
            <span className="text-xs text-[var(--color-text-secondary)]">
              {docsRequeridos.filter((d) => persona.documentos[d.id]?.archivoNombre).length}
              /{docsRequeridos.length} documentos cargados
            </span>
            <div className="flex gap-3">
              <Button variant="outline" type="button" onClick={handleCancelar}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                type="button"
                disabled={!isFormValid || dniMsg?.tipo === "dup"}
                onClick={handleGuardar}
              >
                <CheckCircle2 size={16} />
                Guardar trabajador
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
          {(data.personal || []).length === 0 ? "Añadir primer trabajador" : "Añadir otro trabajador"}
        </Button>
      )}
    </section>
  );
}
