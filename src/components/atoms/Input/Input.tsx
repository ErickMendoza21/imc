"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  /** Ícono o elemento al inicio del input */
  prefix?: ReactNode;
  /** Ícono o elemento al final del input */
  suffix?: ReactNode;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ prefix, suffix, className = "", disabled, ...props }, ref) => {
    return (
      <div
        className={`
          flex items-center w-full
          border border-[var(--color-border)] rounded-md
          transition-all duration-150
          focus-within:border-[var(--color-secondary)]
          focus-within:ring-3 focus-within:ring-[var(--color-secondary)]/15
          ${disabled ? "bg-[var(--color-bg-disabled)] opacity-80 cursor-not-allowed" : "bg-white"}
          ${className}
        `}
      >
        {prefix && (
          <span className={`flex items-center pl-3 shrink-0 ${disabled ? "text-[var(--color-text-secondary)]/50" : "text-[var(--color-secondary)]"}`}>
            {prefix}
          </span>
        )}
        <input
          ref={ref}
          disabled={disabled}
          className={`
            flex-1 border-none outline-none bg-transparent
            px-3 py-[10px] text-[0.9rem]
            font-[var(--font-geist-sans)]
            placeholder:text-[var(--color-text-secondary)]/70
            ${disabled ? "text-[var(--color-text-secondary)] cursor-not-allowed" : "text-[var(--color-title)]"}
          `}
          {...props}
        />
        {suffix && (
          <span className="flex items-center pr-2 text-[var(--color-text-secondary)] shrink-0">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
