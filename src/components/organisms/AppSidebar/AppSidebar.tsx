"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import Swal from "sweetalert2";
import { NAV_ITEMS } from "@/lib/constants/navigation";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    if (savedRole) {
      setRole(savedRole);
    }
  }, []);

  const handleLogout = () => {
    Swal.fire({
      icon: "warning",
      title: "¿Cerrar sesión?",
      text: "Se cerrará tu sesión actual y volverás al inicio de sesión.",
      showCancelButton: true,
      confirmButtonText: "Sí, cerrar sesión",
      cancelButtonText: "Cancelar",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("userRole");
        localStorage.removeItem("username");
        router.push("/login");
      }
    });
  };

  return (
    <aside className="w-[168px] min-h-screen bg-white border-r border-[var(--color-border)] flex flex-col shrink-0">

      {/* ── Logo ── */}
      <div className="flex flex-col justify-center items-center py-5 px-4 border-b border-[var(--color-border)]">
        <img
          src={`${process.env.NEXT_PUBLIC_IMC || ''}/images/logo.png`}
          alt="Logo IMC"
          width={52}
          height={52}
          className="object-contain rounded-full"
        />
        {role && (
          <div className="mt-3 text-center">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold block mb-0.5">
              Perfil
            </span>
            <span className="text-xs font-semibold text-[var(--color-primary)] bg-blue-50 px-2.5 py-0.5 rounded-full inline-block border border-blue-100">
              {role.toLowerCase() === "solicitante"
                ? "Contratista"
                : role.toLowerCase() === "revisor" || role.toLowerCase() === "inspector"
                ? "Revisor"
                : role.toLowerCase() === "sapo"
                ? "S.A.P.O"
                : role.toLowerCase() === "admin"
                ? "Admin"
                : role}
            </span>
          </div>
        )}
      </div>

      {/* ── Navegación ── */}
      <nav
        aria-label="Navegación principal"
        className="flex flex-col gap-1.5 px-3 pt-4 pb-6 flex-1"
      >
        {NAV_ITEMS
          .filter(({ roles }) => !roles || (role && roles.includes(role)))
          .map(({ href, label, icon: Icon }) => {
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

      {/* ── Cerrar sesión ── */}
      <div className="px-3 pb-4 border-t border-[var(--color-border)] pt-3">
        <button
          type="button"
          onClick={handleLogout}
          className="
            flex items-center gap-3 px-3 py-2.5 rounded-lg w-full
            text-[0.8125rem] font-medium
            text-[var(--color-danger)]
            bg-transparent border-none cursor-pointer
            transition-all duration-150
            hover:bg-red-50
          "
        >
          <LogOut size={15} className="shrink-0" />
          <span className="leading-tight truncate">Cerrar sesión</span>
        </button>
      </div>
    </aside>
  );
}

