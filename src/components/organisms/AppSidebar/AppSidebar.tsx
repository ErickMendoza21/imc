"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/constants/navigation";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[168px] min-h-screen bg-white border-r border-[var(--color-border)] flex flex-col shrink-0">

      {/* ── Logo ── */}
      <div className="flex justify-center items-center py-5 px-4 border-b border-[var(--color-border)]">
        <Image
          src="/images/logo.png"
          alt="Logo IMC"
          width={52}
          height={52}
          className="object-contain rounded-full"
          priority
        />
      </div>

      {/* ── Navegación ── */}
      <nav
        aria-label="Navegación principal"
        className="flex flex-col gap-1.5 px-3 pt-4 pb-6"
      >
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg
                text-[0.8125rem] font-medium
                transition-all duration-150
                ${isActive
                  ? "bg-[var(--color-primary)] text-white shadow-[var(--shadow-btn)]"
                  : "text-[var(--color-text-secondary)] hover:bg-[var(--color-primary-light)] hover:text-[var(--color-primary)]"
                }
              `}
            >
              <Icon
                size={15}
                className={`shrink-0 ${isActive ? "text-white" : ""}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span className="leading-tight truncate">{label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
