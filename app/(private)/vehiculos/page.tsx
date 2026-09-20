"use client";

import { VehiculosTable } from "@/components/organisms/VehiculosTable/VehiculosTable";

export default function VehiculosPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold text-[var(--color-title)]">
          Gestión de Vehículos
        </h1>
        <p className="text-[var(--color-text-secondary)]">
          Administra los vehículos de tu empresa para asignarlos a tu personal durante las solicitudes.
        </p>
      </div>

      <VehiculosTable />
    </div>
  );
}
