import { ButtonHTMLAttributes, ReactNode } from "react";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
}

export function Button({
  children,
  variant = "primary",
  className = "",
  ...props
}: ButtonProps) {
  if (variant === "ghost") {
    return (
      <button
        className={`
          bg-transparent border-none cursor-pointer
          text-[var(--color-secondary)] text-sm font-medium
          underline underline-offset-2
          transition-colors duration-150
          hover:text-[var(--color-primary)]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }

  if (variant === "outline") {
    return (
      <button
        className={`
          flex items-center justify-center gap-2
          px-5 py-2.5 rounded-md
          bg-white border border-[var(--color-border)]
          text-[var(--color-title)] text-sm font-semibold
          cursor-pointer
          transition-all duration-150
          hover:border-[var(--color-secondary)] hover:text-[var(--color-secondary)]
          disabled:opacity-60 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }

  // primary (default)
  return (
    <button
      className={`
        flex items-center justify-center gap-2 w-full
        px-5 py-2.5 rounded-md
        bg-[var(--color-primary)] text-white
        text-[0.95rem] font-semibold
        shadow-[var(--shadow-btn)]
        border-none cursor-pointer
        transition-all duration-150
        hover:not-disabled:bg-[var(--color-secondary)]
        hover:not-disabled:-translate-y-px
        hover:not-disabled:shadow-[0_4px_14px_0_rgba(13,71,181,0.30)]
        active:not-disabled:translate-y-0
        active:not-disabled:shadow-[var(--shadow-btn)]
        disabled:opacity-60 disabled:cursor-not-allowed
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  );
}
