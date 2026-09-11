"use client";

import { ReactNode, TextareaHTMLAttributes, useState } from "react";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "prefix"> {
  /** Ícono en la esquina superior izquierda */
  prefix?: ReactNode;
  /** Muestra contador de caracteres si se proporciona maxLength */
  showCount?: boolean;
  className?: string;
}

export function Textarea({
  prefix,
  showCount = false,
  className = "",
  maxLength,
  onChange,
  defaultValue,
  value,
  ...props
}: TextareaProps) {
  const [count, setCount] = useState(
    typeof value === "string"
      ? value.length
      : typeof defaultValue === "string"
      ? defaultValue.length
      : 0
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCount(e.target.value.length);
    onChange?.(e);
  };

  return (
    <div
      className={`
        relative w-full
        border border-[var(--color-border)] rounded-md
        bg-white
        transition-all duration-150
        focus-within:border-[var(--color-secondary)]
        focus-within:ring-3 focus-within:ring-[var(--color-secondary)]/15
        ${className}
      `}
    >
      {prefix && (
        <span className="absolute top-3 left-3 text-[var(--color-secondary)] pointer-events-none">
          {prefix}
        </span>
      )}
      <textarea
        className={`
          w-full border-none outline-none bg-transparent resize-none
          ${prefix ? "pl-9" : "pl-3"} pr-3 pt-3
          ${showCount && maxLength ? "pb-7" : "pb-3"}
          text-[0.9rem] min-h-[100px]
          text-[var(--color-title)] font-[var(--font-geist-sans)]
          placeholder:text-[var(--color-text-secondary)]/70
        `}
        maxLength={maxLength}
        value={value}
        defaultValue={defaultValue}
        onChange={handleChange}
        {...props}
      />
      {showCount && maxLength !== undefined && (
        <span className="absolute bottom-2 right-3 text-xs text-[var(--color-text-secondary)]/70 pointer-events-none">
          {count}/{maxLength}
        </span>
      )}
    </div>
  );
}
