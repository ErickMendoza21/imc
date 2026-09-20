import { FileText, Upload, CheckSquare, Square } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Persona } from "./StepPersonal";

export interface CargaMasivaItem {
  archivo: File | null;
  fechaEmision: string;
  personalIds: string[];
}

export interface StepCargaMasivaData {
  clasificacion: "TAR" | "NO_TAR" | "";
  personal: Persona[];
  cargaMasiva: Record<string, CargaMasivaItem>;
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
  
  const docsParaMostrar = isTar 
    ? [...DOCS_BASE, ...DOCS_TAR_EXTRAS]
    : DOCS_BASE;

  const handleChangeFecha = (id: string, fecha: string) => {
    setData((prev: any) => ({
      ...prev,
      cargaMasiva: {
        ...prev.cargaMasiva,
        [id]: {
          ...(prev.cargaMasiva?.[id] || { archivo: null, personalIds: [] }),
          fechaEmision: fecha,
        },
      },
    }));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setData((prev: any) => ({
      ...prev,
      cargaMasiva: {
        ...prev.cargaMasiva,
        [id]: {
          ...(prev.cargaMasiva?.[id] || { fechaEmision: "", personalIds: [] }),
          archivo: file,
        },
      },
    }));
  };

  const handleTogglePersonal = (docId: string, personaId: string) => {
    setData((prev: any) => {
      const docData = prev.cargaMasiva?.[docId] || { archivo: null, fechaEmision: "", personalIds: [] };
      const currentIds = docData.personalIds;
      const newIds = currentIds.includes(personaId)
        ? currentIds.filter((id: string) => id !== personaId)
        : [...currentIds, personaId];

      return {
        ...prev,
        cargaMasiva: {
          ...prev.cargaMasiva,
          [docId]: {
            ...docData,
            personalIds: newIds,
          },
        },
      };
    });
  };

  const handleToggleAllPersonal = (docId: string, selectAll: boolean) => {
    setData((prev: any) => {
      const docData = prev.cargaMasiva?.[docId] || { archivo: null, fechaEmision: "", personalIds: [] };
      const newIds = selectAll ? (data.personal || []).map(p => p.id) : [];

      return {
        ...prev,
        cargaMasiva: {
          ...prev.cargaMasiva,
          [docId]: {
            ...docData,
            personalIds: newIds,
          },
        },
      };
    });
  };

  return (
    <section className="px-8 py-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)]">
          Carga Masiva de Documentos
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Sube los documentos generales y selecciona a qué personal aplican. Todos los documentos mostrados son obligatorios.
        </p>
      </div>

      {(data.personal || []).length === 0 ? (
        <div className="p-8 text-center border-2 border-dashed border-[var(--color-border)] rounded-xl bg-[var(--color-bg-soft)]">
          <p className="text-[var(--color-text-secondary)]">
            No tienes personal registrado. Vuelve al paso anterior para añadir personal.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {docsParaMostrar.map((doc) => {
            const docData = data.cargaMasiva?.[doc.id] || { fechaEmision: "", archivo: null, personalIds: [] };
            const isAllSelected = data.personal && docData.personalIds.length === data.personal.length;

            return (
              <div
                key={doc.id}
                className="flex flex-col md:flex-row gap-6 p-5 rounded-xl border border-[var(--color-border)] bg-white shadow-sm"
              >
                {/* Lado izquierdo: Documento */}
                <div className="flex-1 flex flex-col gap-4">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 text-[var(--color-primary)] mt-1">
                      <FileText size={28} strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-[var(--color-primary)] mb-1 pr-2 leading-tight" title={doc.label}>
                        {doc.label}
                      </p>
                      <p className="text-[10px] text-[var(--color-text-secondary)] mb-3 font-medium">
                        Formatos permitidos: {doc.accept.replace(/\./g, '').toUpperCase()}
                      </p>
                      
                      <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-primary-light)]/50 hover:bg-[var(--color-primary-light)] text-sm font-medium text-[var(--color-primary)] transition-colors">
                        <Upload size={14} />
                        {docData.archivo ? docData.archivo.name : "Cargar archivo"}
                        <input
                          type="file"
                          accept={doc.accept}
                          className="hidden"
                          onChange={(e) => handleFileChange(doc.id, e.target.files?.[0] || null)}
                        />
                      </label>
                    </div>
                  </div>

                  {/* Fecha de Emisión */}
                  {doc.hasFecha && (
                    <div className="w-full max-w-[200px] flex flex-col gap-1.5 pl-11">
                      <label
                        htmlFor={`fecha-${doc.id}`}
                        className="text-xs font-semibold text-[var(--color-text-secondary)]"
                      >
                        Fecha de emisión
                      </label>
                      <Input
                        id={`fecha-${doc.id}`}
                        type="date"
                        value={docData.fechaEmision}
                        onChange={(e) => handleChangeFecha(doc.id, e.target.value)}
                      />
                    </div>
                  )}
                </div>

                {/* Lado derecho: Selección de Personal */}
                <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col gap-2">
                  <div className="flex items-center justify-between pb-2 border-b border-[var(--color-border)]">
                    <span className="text-xs font-semibold text-[var(--color-text-secondary)]">Personal asociado</span>
                    <button
                      type="button"
                      className="text-xs text-[var(--color-primary)] hover:underline flex items-center gap-1"
                      onClick={() => handleToggleAllPersonal(doc.id, !isAllSelected)}
                    >
                      {isAllSelected ? (
                        <><CheckSquare size={14} /> Desmarcar todos</>
                      ) : (
                        <><Square size={14} /> Marcar todos</>
                      )}
                    </button>
                  </div>
                  
                  <div className="flex flex-col gap-1 max-h-40 overflow-y-auto pr-1">
                    {data.personal.map(p => (
                      <label key={p.id} className="flex items-center gap-2 p-1.5 hover:bg-[var(--color-bg-soft)] rounded cursor-pointer transition-colors">
                        <input
                          type="checkbox"
                          className="w-4 h-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                          checked={docData.personalIds.includes(p.id)}
                          onChange={() => handleTogglePersonal(doc.id, p.id)}
                        />
                        <span className="text-xs text-[var(--color-text)] truncate">{p.nombre} ({p.dni})</span>
                      </label>
                    ))}
                  </div>
                  {docData.personalIds.length === 0 && (
                     <p className="text-[10px] text-[var(--color-danger)] mt-1">Debe seleccionar al menos a una persona.</p>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
