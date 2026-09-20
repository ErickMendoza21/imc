"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  User,
  Building2,
  FileText,
  MapPin,
  Phone,
  Mail,
  Plus,
  ClipboardList,
} from "lucide-react";

import { Button } from "@/components/atoms/Button";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { FormField } from "@/components/molecules/FormField";
import { SEDES_MOCK } from "@/lib/constants/solicitud";
import { getUsuarioByUsername, type Usuario } from "@/lib/services/usuarios";

export function SolicitanteInicio() {
  const router = useRouter();
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const username = localStorage.getItem("username");
    if (username) {
      const found = getUsuarioByUsername(username);
      setUsuario(found);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-[var(--color-text-secondary)]">Cargando...</p>
      </div>
    );
  }

  if (!usuario) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <p className="text-[var(--color-text-secondary)]">
          No se encontraron datos de usuario.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Encabezado ── */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--color-primary-light)] rounded-xl">
          <ClipboardList size={28} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-title)] leading-tight">
            Bienvenido, {usuario.nombreCompleto}
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Revisa tus datos y crea una nueva solicitud de servicio.
          </p>
        </div>
      </div>

      {/* ── Card con datos ── */}
      <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
        {/* ── Dos columnas ── */}
        <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
          {/* ── Columna izquierda: Datos generales ── */}
          <section className="px-8 py-6" aria-labelledby="datos-generales-heading">
            <div className="flex items-center gap-2 mb-5">
              <FileText size={18} className="text-[var(--color-secondary)]" />
              <h2
                id="datos-generales-heading"
                className="text-base font-bold text-[var(--color-title)]"
              >
                Datos generales
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <FormField label="Nombre de la empresa" htmlFor="campo-empresa">
                <Input
                  id="campo-empresa"
                  type="text"
                  value={usuario.empresa}
                  prefix={<Building2 size={15} />}
                  disabled
                  readOnly
                />
              </FormField>

              <FormField label="Descripción del proyecto" htmlFor="campo-descripcion">
                <Textarea
                  id="campo-descripcion"
                  value={usuario.descripcion}
                  prefix={<FileText size={15} />}
                  disabled
                  readOnly
                  rows={3}
                />
              </FormField>

              <FormField label="Sede a la que va a asistir" htmlFor="campo-sede">
                <Select
                  id="campo-sede"
                  options={SEDES_MOCK}
                  value={usuario.sede}
                  disabled
                />
              </FormField>
            </div>
          </section>

          {/* ── Columna derecha: Datos del solicitante ── */}
          <section className="px-8 py-6" aria-labelledby="datos-solicitante-heading">
            <div className="flex items-center gap-2 mb-5">
              <User size={18} className="text-[var(--color-secondary)]" />
              <h2
                id="datos-solicitante-heading"
                className="text-base font-bold text-[var(--color-title)]"
              >
                Datos del solicitante
              </h2>
            </div>

            <div className="flex flex-col gap-4">
              <FormField label="Nombre completo" htmlFor="campo-nombre">
                <Input
                  id="campo-nombre"
                  type="text"
                  value={usuario.nombreCompleto}
                  prefix={<User size={15} />}
                  disabled
                  readOnly
                />
              </FormField>

              <FormField label="Celular" htmlFor="campo-celular">
                <Input
                  id="campo-celular"
                  type="text"
                  value={usuario.celular}
                  prefix={<Phone size={15} />}
                  disabled
                  readOnly
                />
              </FormField>

              <FormField label="Correo" htmlFor="campo-correo">
                <Input
                  id="campo-correo"
                  type="email"
                  value={usuario.correo}
                  prefix={<Mail size={15} />}
                  disabled
                  readOnly
                />
              </FormField>
            </div>
          </section>
        </div>
      </div>

      {/* ── Botón crear solicitud ── */}
      <div className="flex justify-end">
        <Button
          type="button"
          variant="primary"
          onClick={() => router.push("/nueva-solicitud")}
          className="w-auto"
        >
          <Plus size={18} />
          Crear solicitud
        </Button>
      </div>
    </div>
  );
}
