import { UserCircle, ChevronDown } from "lucide-react";

export function AppHeader() {
  return (
    <header className="h-14 bg-white border-b border-[var(--color-border)] flex items-center justify-end px-6 shrink-0">
      <button
        type="button"
        className="
          flex items-center gap-2 text-sm font-medium
          text-[var(--color-title)] cursor-pointer
          transition-colors duration-150
          hover:text-[var(--color-secondary)]
          bg-transparent border-none
        "
        aria-label="Menú de usuario"
      >
        <UserCircle size={28} className="text-[var(--color-text-secondary)]" />
        <span>Usuario</span>
        <ChevronDown size={15} className="text-[var(--color-text-secondary)]" />
      </button>
    </header>
  );
}
