import { FileText, Upload, Calendar } from "lucide-react";
import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";

export interface RequisitoData {
  archivo: File | null;
  fechaEmision: string;
}

export interface StepRequisitosTARData {
  requisitos: Record<string, RequisitoData>;
}

interface StepRequisitosTARProps {
  data: StepRequisitosTARData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

const REQUISITOS = [
  { id: "pets", label: "PETS (Procedimiento de Trabajo Seguro)" },
  { id: "programa", label: "Programa de seguridad y salud en el trabajo" },
  { id: "iperc", label: "IPERC (Identificación de peligros y evaluación de riesgos)" },
  { id: "otros", label: "Otros documentos" },
];

export function StepRequisitosTAR({ data, setData }: StepRequisitosTARProps) {
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
          Requisitos generales (TAR)
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)]">
          Adjunta los documentos requeridos y registra la fecha de emisión.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {REQUISITOS.map((req) => {
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
                <p className="text-sm font-bold text-[var(--color-primary)] mb-2 truncate">
                  {req.label}
                </p>
                <div className="flex items-center gap-3">
                  <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 rounded border border-[var(--color-border)] bg-[var(--color-primary-light)]/50 hover:bg-[var(--color-primary-light)] text-sm font-medium text-[var(--color-primary)] transition-colors">
                    <Upload size={14} />
                    {docData.archivo ? docData.archivo.name : "Cargar archivo"}
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => handleFileChange(req.id, e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>

              {/* Input de Fecha de Emisión */}
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
                // The native date input shows a calendar icon on most modern browsers, 
                // but we could also use suffix={<Calendar size={15} />} if desired
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
