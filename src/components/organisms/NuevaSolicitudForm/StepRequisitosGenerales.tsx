import { FileText, Upload, Calendar } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

export interface RequisitoData {
  archivo: File | null;
  fechaEmision: string;
}

export interface StepRequisitosGeneralesData {
  clasificacion: "TAR" | "NO_TAR" | "";
  requisitos: Record<string, RequisitoData>;
}

interface StepRequisitosGeneralesProps {
  data: StepRequisitosGeneralesData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const REQUISITOS_NO_TAR = [
  { id: "personal", label: "Lista de personal (Data de plataforma)" },
  { id: "iperc", label: "Matriz IPERC" },
  { id: "directorio", label: "Directorio telefónico en caso de emergencia y red de clínicas cercanas" },
  { id: "matriz_aspectos", label: "Matriz de aspectos e impactos ambientales de la actividad a realizar" },
];

const REQUISITOS_TAR_EXTRAS = [
  { id: "pets", label: "PETS (Procedimiento escrito de trabajo seguro)" },
  { id: "plan_emergencia", label: "Plan de emergencia de acuerdo al servicio" },
  { id: "lista_epp", label: "Lista de EPP" },
  { id: "fichas_epp", label: "Fichas técnicas de EPP" },
];

export function StepRequisitosGenerales({ data, setData }: StepRequisitosGeneralesProps) {
  const isTar = data.clasificacion === "TAR";
  
  // Si es TAR, se muestran los 4 básicos + 4 extras. Si es NO_TAR, solo los 4 básicos.
  const requisitosParaMostrar = isTar 
    ? [...REQUISITOS_NO_TAR, ...REQUISITOS_TAR_EXTRAS]
    : REQUISITOS_NO_TAR;

  const handleChangeFecha = (id: string, fecha: string) => {
    setData((prev: any) => ({
      ...prev,
      requisitos: {
        ...prev.requisitos,
        [id]: {
          ...prev.requisitos?.[id],
          fechaEmision: fecha,
        },
      },
    }));
  };

  const handleFileChange = (id: string, file: File | null) => {
    setData((prev: any) => ({
      ...prev,
      requisitos: {
        ...prev.requisitos,
        [id]: {
          ...prev.requisitos?.[id],
          archivo: file,
        },
      },
    }));
  };

  return (
    <section className="px-8 py-6 flex flex-col gap-5">
      <div className="flex flex-col gap-1 mb-2">
        <h2 className="text-lg font-bold text-[var(--color-title)]">
          Requisitos Generales {isTar ? "(TAR)" : "(No TAR)"}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Adjunta los {requisitosParaMostrar.length} documentos requeridos y registra la fecha de emisión.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {requisitosParaMostrar.map((req) => {
          const docData = data.requisitos?.[req.id] || { fechaEmision: "", archivo: null };

          return (
            <div
              key={req.id}
              className="flex items-center gap-4 p-4 rounded-xl border border-[var(--color-border)] bg-white shadow-sm"
            >
              {/* Icono de documento */}
              <div className="shrink-0 text-[var(--color-primary)]">
                <FileText size={32} strokeWidth={1.5} />
              </div>

              {/* Título y botón cargar */}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-[var(--color-primary)] mb-2 pr-2 leading-tight" title={req.label}>
                  {req.label}
                </p>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-primary-light)]/50 hover:bg-[var(--color-primary-light)] text-sm font-medium text-[var(--color-primary)] transition-colors">
                    <Upload size={14} />
                    {docData.archivo ? docData.archivo.name : "Cargar archivo"}
                    <input
                      type="file"
                      accept={["iperc", "matriz_aspectos", "pets"].includes(req.id) ? ".pdf,.xls,.xlsx" : ".pdf"}
                      className="hidden"
                      onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Input de Fecha de Emisión */}
              {req.id !== "personal" && req.id !== "lista_epp" && req.id !== "fichas_epp" && (
                <div className="w-48 shrink-0 flex flex-col gap-1.5">
                  <label
                    htmlFor={`fecha-${req.id}`}
                    className="text-xs font-semibold text-[var(--color-text-secondary)]"
                  >
                    Fecha de emisión
                  </label>
                  <Input
                    id={`fecha-${req.id}`}
                    type="date"
                    value={docData.fechaEmision}
                    onChange={(e) => handleChangeFecha(req.id, e.target.value)}
                  />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
