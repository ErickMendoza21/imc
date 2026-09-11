import { ReactNode, SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
  placeholder?: string;
  /** Ícono a la izquierda del select */
  prefix?: ReactNode;
  className?: string;
}

export function Select({
  options,
  placeholder = "Selecciona una opción",
  prefix,
  className = "",
  ...props
}: SelectProps) {
  return (
    <div
      className={`
        relative flex items-center w-full
        border border-[var(--color-border)] rounded-md
        bg-white
        transition-all duration-150
        focus-within:border-[var(--color-secondary)]
        focus-within:ring-3 focus-within:ring-[var(--color-secondary)]/15
        ${className}
      `}
    >
      {prefix && (
        <span className="flex items-center pl-3 text-[var(--color-secondary)] shrink-0 pointer-events-none">
          {prefix}
        </span>
      )}
      <select
        className="
          flex-1 appearance-none border-none outline-none bg-transparent
          px-3 py-[10px] text-[0.9rem] cursor-pointer
          text-[var(--color-title)] font-[var(--font-geist-sans)]
        "
        {...props}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="absolute right-3 text-[var(--color-text-secondary)] pointer-events-none shrink-0"
      />
    </div>
  );
}
