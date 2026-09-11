import { ClipboardCheck, CheckCircle2 } from "lucide-react";

const CHECKLIST_ITEMS = [
  "Nombre de la empresa",
  "Descripción del proyecto",
  "Sede a la que asistirá",
  "Datos del solicitante",
  "Clasificación del trabajo",
];

interface InfoPanelProps {
  className?: string;
}

export function InfoPanel({ className = "" }: InfoPanelProps) {
  return (
    <aside
      aria-label="Información importante"
      className={`
        bg-white border border-[var(--color-border)] rounded-xl
        p-5 flex flex-col gap-4 h-fit
        ${className}
      `}
    >
      {/* Encabezado */}
      <div className="flex items-center gap-2">
        <ClipboardCheck
          size={20}
          className="text-[var(--color-secondary)] shrink-0"
        />
        <h2 className="text-sm font-bold text-[var(--color-title)]">
          Información importante
        </h2>
      </div>

      {/* Descripción */}
      <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
        Asegúrate de completar todos los campos para continuar con el registro
        de tu solicitud.
      </p>

      {/* Checklist */}
      <ul className="flex flex-col gap-2">
        {CHECKLIST_ITEMS.map((item) => (
          <li key={item} className="flex items-center gap-2">
            <CheckCircle2
              size={15}
              className="text-[var(--color-secondary)] shrink-0"
            />
            <span className="text-xs text-[var(--color-text-secondary)]">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </aside>
  );
}
