"use client";

import { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  suffix?: ReactNode;
  className?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ suffix, className = "", ...props }, ref) => {
    return (
      <div
        className={`
          flex items-center w-full
          border border-[var(--color-border)] rounded-md
          bg-white
          transition-all duration-150
          focus-within:border-[var(--color-secondary)]
          focus-within:ring-3 focus-within:ring-[var(--color-secondary)]/15
          ${className}
        `}
      >
        <input
          ref={ref}
          className="
            flex-1 border-none outline-none bg-transparent
            px-4 py-[10px] text-[0.9rem]
            text-[var(--color-title)] font-[var(--font-geist-sans)]
            placeholder:text-[var(--color-text-secondary)]/70
          "
          {...props}
        />
        {suffix && (
          <span className="flex items-center pr-2 text-[var(--color-text-secondary)]">
            {suffix}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
export { Input };
