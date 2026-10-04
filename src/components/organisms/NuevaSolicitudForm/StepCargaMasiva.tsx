"use client";

import Swal from "sweetalert2";
import { FileText, Upload, CheckSquare, Square, Plus, Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Persona } from "./StepPersonal";

export interface CargaMasivaItem {
  id: string; // ID único temporal para el formulario
  archivo: File | null;
  fechaEmision: string;
  personalIds: string[];
}

export interface StepCargaMasivaData {
  clasificacion: "TAR" | "NO_TAR" | "";
  personal: Persona[];
  cargaMasiva: Record<string, CargaMasivaItem[]>;
}

interface StepCargaMasivaProps {
  data: StepCargaMasivaData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const DOCS_BASE = [
  { id: "sctr", label: "SCTR (Salud y Pensión)", hasFecha: false, accept: ".pdf" },
  { id: "samo", label: "Acreditamiento SAMO", hasFecha: true, accept: ".pdf" },
  { id: "iperc", label: "Registro de difusión de Matriz IPERC", hasFecha: true, accept: ".pdf" },
];

const DOCS_TAR_EXTRAS = [
  { id: "pets", label: "Registro de difusión de Matriz PETS", hasFecha: true, accept: ".pdf,.xls,.xlsx" },
];

export function StepCargaMasiva({ data, setData }: StepCargaMasivaProps) {
  const isTar = data.clasificacion === "TAR";
  const docsParaMostrar = isTar ? [...DOCS_BASE, ...DOCS_TAR_EXTRAS] : DOCS_BASE;
  const totalPersonal = data.personal || [];

  // ── Helpers de Estado ──
  const getDocItems = (docId: string): CargaMasivaItem[] => {
    const items = data.cargaMasiva?.[docId];
    if (Array.isArray(items) && items.length > 0) return items;
    // Si no hay ninguno, inicializamos con 1 vacío
    return [{ id: crypto.randomUUID(), archivo: null, fechaEmision: "", personalIds: [] }];
  };

  const updateDocItems = (docId: string, items: CargaMasivaItem[]) => {
    setData((prev: any) => ({
      ...prev,
      cargaMasiva: {
        ...prev.cargaMasiva,
        [docId]: items,
      },
    }));
  };

  // ── Manejo de Archivos/Pólizas ──
  const handleAddFile = (docId: string) => {
    const current = getDocItems(docId);
    updateDocItems(docId, [
      ...current,
      { id: crypto.randomUUID(), archivo: null, fechaEmision: "", personalIds: [] },
    ]);
  };

  const handleRemoveFile = (docId: string, fileId: string) => {
    const current = getDocItems(docId);
    if (current.length <= 1) return;

    Swal.fire({
      icon: "warning",
      title: "¿Eliminar este archivo?",
      text: "Se perderá el archivo cargado y las asignaciones de personal vinculadas a este archivo.",
      showCancelButton: true,
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        updateDocItems(docId, current.filter((i) => i.id !== fileId));
      }
    });
  };

  const handleChangeFile = (docId: string, fileId: string, file: File | null) => {
    const current = getDocItems(docId);
    updateDocItems(docId, current.map((i) => (i.id === fileId ? { ...i, archivo: file } : i)));
  };

  const handleChangeDate = (docId: string, fileId: string, date: string) => {
    const current = getDocItems(docId);
    updateDocItems(docId, current.map((i) => (i.id === fileId ? { ...i, fechaEmision: date } : i)));
  };

  // ── Manejo de Personal Asignado ──
  const handleTogglePersonal = (docId: string, fileId: string, personaId: string) => {
    const current = getDocItems(docId);
    updateDocItems(
      docId,
      current.map((item) => {
        if (item.id === fileId) {
          const ids = item.personalIds;
          return {
            ...item,
            personalIds: ids.includes(personaId)
              ? ids.filter((id) => id !== personaId)
              : [...ids, personaId],
          };
        }
        return item;
      })
    );
  };

  const handleToggleAll = (docId: string, fileId: string, availableIds: string[], selectAll: boolean) => {
    const current = getDocItems(docId);
    updateDocItems(
      docId,
      current.map((item) => {
        if (item.id === fileId) {
          return {
            ...item,
            personalIds: selectAll ? [...availableIds] : [],
          };
        }
        return item;
      })
    );
  };

  return (
    <section className="px-8 py-6 flex flex-col gap-6">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)]">Carga Masiva de Documentos</h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Sube los documentos generales y selecciona a qué personal aplican. Si un documento (ej. SCTR) está en varias pólizas o archivos, añade otro y marca a los trabajadores restantes. No puede quedar ningún trabajador sin anexar.
        </p>
      </div>

      {totalPersonal.length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-soft)]">
          <p className="text-[var(--color-text-secondary)]">
            No tienes personal registrado. Vuelve al paso anterior para añadir personal.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {docsParaMostrar.map((doc) => {
            const fileItems = getDocItems(doc.id);

            // Calcular cuántos trabajadores en total están cubiertos por este doc
            const allCoveredIds = new Set<string>();
            fileItems.forEach((f) => f.personalIds.forEach((id) => allCoveredIds.add(id)));
            const allCovered = allCoveredIds.size === totalPersonal.length;

            return (
              <div key={doc.id} className="flex flex-col gap-3">
                {/* Encabezado del documento */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-[var(--color-primary)]">
                    <FileText size={24} />
                    <h3 className="font-bold">{doc.label}</h3>
                  </div>
                  <div className="flex items-center gap-4">
                    {allCovered ? (
                      <span className="text-xs font-semibold text-[var(--color-success)] bg-green-50 px-2 py-1 rounded">
                        ✓ Personal 100% cubierto
                      </span>
                    ) : (
                      <span className="text-xs font-semibold text-[var(--color-danger)] flex items-center gap-1">
                        <AlertCircle size={14} /> Faltan asignar {totalPersonal.length - allCoveredIds.size} trab.
                      </span>
                    )}
                    <Button
                      type="button"
                      variant="outline"
                      className="text-xs py-1 px-3 border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary)] hover:text-white"
                      onClick={() => handleAddFile(doc.id)}
                      disabled={allCovered} // Opcional: deshabilitar si ya están todos cubiertos
                      title={allCovered ? "Todos los trabajadores ya están cubiertos" : "Añadir otro archivo para los restantes"}
                    >
                      <Plus size={14} className="mr-1" />
                      Agregar póliza/archivo
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-4 pl-4 border-l-2 border-[var(--color-border)]">
                  {fileItems.map((fileItem, idx) => {
                    // Trabajadores asignados a OTROS archivos de este mismo documento
                    const assignedToOthers = new Set<string>();
                    fileItems.forEach((otherFile) => {
                      if (otherFile.id !== fileItem.id) {
                        otherFile.personalIds.forEach((id) => assignedToOthers.add(id));
                      }
                    });

                    // Solo mostramos los trabajadores que NO están en otros archivos
                    const availableWorkers = totalPersonal.filter((p) => !assignedToOthers.has(p.id));
                    const isAllSelected = fileItem.personalIds.length === availableWorkers.length && availableWorkers.length > 0;

                    return (
                      <div
                        key={fileItem.id}
                        className="flex flex-col lg:flex-row gap-6 p-4 rounded-xl border border-[var(--color-border)] bg-white shadow-sm transition-all hover:border-[var(--color-secondary)]/30"
                      >
                        {/* Izquierda: Archivo y Fecha */}
                        <div className="flex-1 flex flex-col gap-4">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold uppercase tracking-wider text-[var(--color-text-secondary)]">
                              Archivo {idx + 1}
                            </span>
                            {fileItems.length > 1 && (
                              <button
                                type="button"
                                className="text-[var(--color-danger)] hover:bg-red-50 p-1.5 rounded transition-colors"
                                onClick={() => handleRemoveFile(doc.id, fileItem.id)}
                                title="Eliminar este archivo"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>

                          <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-primary)] hover:bg-[var(--color-bg-soft)] text-sm font-medium text-[var(--color-primary)] transition-all">
                            <Upload size={16} />
                            <span className="truncate max-w-[200px]">
                              {fileItem.archivo ? fileItem.archivo.name : "Subir documento"}
                            </span>
                            <input
                              type="file"
                              accept={doc.accept}
                              className="hidden"
                              onChange={(e) => handleChangeFile(doc.id, fileItem.id, e.target.files?.[0] || null)}
                            />
                          </label>

                          {doc.hasFecha && (
                            <div className="flex flex-col gap-1.5">
                              <label className="text-xs font-semibold text-[var(--color-text-secondary)]">
                                Fecha de emisión <span className="text-[var(--color-danger)]">*</span>
                              </label>
                              <Input
                                type="date"
                                className="w-full max-w-[200px]"
                                value={fileItem.fechaEmision}
                                onChange={(e) => handleChangeDate(doc.id, fileItem.id, e.target.value)}
                              />
                            </div>
                          )}
                        </div>

                        {/* Derecha: Stock de personas */}
                        <div className="w-full lg:w-3/5 flex flex-col gap-2 bg-[var(--color-bg-soft)] rounded-lg p-3 border border-[var(--color-border)]/50">
                          <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                            <span className="text-xs font-bold text-[var(--color-title)]">
                              Trabajadores cubiertos por este archivo
                            </span>
                            {availableWorkers.length > 0 && (
                              <button
                                type="button"
                                className="text-[11px] font-semibold text-[var(--color-primary)] hover:underline flex items-center gap-1"
                                onClick={() =>
                                  handleToggleAll(doc.id, fileItem.id, availableWorkers.map((w) => w.id), !isAllSelected)
                                }
                              >
                                {isAllSelected ? (
                                  <>
                                    <Square size={13} /> Desmarcar todos
                                  </>
                                ) : (
                                  <>
                                    <CheckSquare size={13} /> Marcar todos los disponibles
                                  </>
                                )}
                              </button>
                            )}
                          </div>

                          <div className="flex flex-col gap-1 max-h-[160px] overflow-y-auto pr-2 custom-scrollbar">
                            {availableWorkers.length === 0 ? (
                              <p className="text-xs text-[var(--color-text-secondary)] py-4 text-center italic">
                                No hay trabajadores disponibles (todos asignados a otros archivos).
                              </p>
                            ) : (
                              availableWorkers.map((p) => (
                                <label
                                  key={p.id}
                                  className={`flex items-center gap-3 p-2 rounded cursor-pointer transition-colors border ${
                                    fileItem.personalIds.includes(p.id)
                                      ? "bg-white border-[var(--color-secondary)]/50 shadow-sm"
                                      : "hover:bg-white border-transparent"
                                  }`}
                                >
                                  <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)] accent-[var(--color-primary)]"
                                    checked={fileItem.personalIds.includes(p.id)}
                                    onChange={() => handleTogglePersonal(doc.id, fileItem.id, p.id)}
                                  />
                                  <span className="text-[13px] text-[var(--color-text)] font-medium truncate">
                                    {p.nombre} <span className="text-[11px] text-gray-500 font-normal">({p.dni})</span>
                                  </span>
                                </label>
                              ))
                            )}
                          </div>
                          {fileItem.personalIds.length === 0 && availableWorkers.length > 0 && (
                            <p className="text-[10px] font-bold text-[var(--color-danger)] mt-1">
                              Debes seleccionar al menos a una persona.
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
