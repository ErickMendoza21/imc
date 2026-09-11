import { ReactNode } from "react";

export interface FormFieldProps {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  required = false,
  error,
  children,
  className = "",
}: FormFieldProps) {
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-[var(--color-title)] select-none"
      >
        {label}
        {required && (
          <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p
          className="text-[0.8rem] text-[var(--color-danger)] mt-0.5"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
