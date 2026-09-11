import { ReactNode } from "react";

export type RiskVariant = "danger" | "success";

export interface RiskCardProps {
  value: string;
  label: string;
  description: string;
  icon: ReactNode;
  variant: RiskVariant;
  selected: boolean;
  onChange: (value: string) => void;
  className?: string;
}

const variantStyles: Record<RiskVariant, { border: string; bg: string; text: string; ring: string }> = {
  danger:  {
    border: "border-[var(--color-danger)]",
    bg:     "bg-[#fff5f5]",
    text:   "text-[var(--color-danger)]",
    ring:   "ring-[var(--color-danger)]/20",
  },
  success: {
    border: "border-[var(--color-success)]",
    bg:     "bg-[#f0fdf8]",
    text:   "text-[var(--color-success)]",
    ring:   "ring-[var(--color-success)]/20",
  },
};

export function RiskCard({
  value,
  label,
  description,
  icon,
  variant,
  selected,
  onChange,
  className = "",
}: RiskCardProps) {
  const styles = variantStyles[variant];

  return (
    <label
      htmlFor={`risk-${value}`}
      className={`
        relative flex items-start gap-3 p-4 rounded-lg border cursor-pointer
        transition-all duration-150
        ${selected
          ? `${styles.border} ${styles.bg} ring-2 ${styles.ring}`
          : "border-[var(--color-border)] bg-white hover:border-[var(--color-border)] hover:bg-gray-50"
        }
        ${className}
      `}
    >
      {/* Ícono */}
      <div className={`shrink-0 mt-0.5 ${styles.text}`}>{icon}</div>

      {/* Texto */}
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold leading-snug ${styles.text}`}>
          {label}
        </p>
        <p className="text-xs text-[var(--color-text-secondary)] mt-0.5 leading-snug">
          {description}
        </p>
      </div>

      {/* Radio */}
      <div className="shrink-0 flex items-center">
        <input
          id={`risk-${value}`}
          type="radio"
          name="clasificacion"
          value={value}
          checked={selected}
          onChange={() => onChange(value)}
          className="w-4 h-4 accent-[var(--color-primary)] cursor-pointer"
        />
      </div>
    </label>
  );
}
