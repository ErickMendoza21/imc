"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { SolicitanteInicio } from "@/components/organisms/SolicitanteInicio";

export default function InicioPage() {
  const router = useRouter();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const savedRole = localStorage.getItem("userRole");
    setRole(savedRole);

    // Si es admin, redirigir a la vista de usuarios
    if (savedRole === "admin") {
      router.replace("/usuarios");
    }
  }, [router]);

  if (role === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--color-text-secondary)]">Cargando...</p>
      </div>
    );
  }

  if (role === "solicitante") {
    return <SolicitanteInicio />;
  }

  // Fallback para roles no mapeados
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <p className="text-[var(--color-text-secondary)]">
        Vista no disponible para tu rol.
      </p>
    </div>
  );
}
