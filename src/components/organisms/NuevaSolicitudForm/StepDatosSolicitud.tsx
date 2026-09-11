import { Building2, FileText, MapPin, User, Phone, Mail, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { RiskCard } from "@/components/molecules/RiskCard";
import { SEDES_MOCK } from "@/lib/constants/solicitud";

export interface StepDatosSolicitudData {
  empresa: string;
  descripcion: string;
  sede: string;
  nombreSolicitante: string;
  celular: string;
  correo: string;
  clasificacion: "TAR" | "NO_TAR" | "";
}

interface StepDatosSolicitudProps {
  data: StepDatosSolicitudData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

export function StepDatosSolicitud({ data, setData }: StepDatosSolicitudProps) {
  return (
    <>
      {/* ── Cuerpo: dos columnas ── */}
      <div className="grid grid-cols-2 divide-x divide-[var(--color-border)]">
        {/* ── Columna izquierda: Datos generales ── */}
        <section className="px-8 py-6" aria-labelledby="datos-generales-heading">
          <div className="flex items-center gap-2 mb-5">
            <FileText size={18} className="text-[var(--color-secondary)]" />
            <h2 id="datos-generales-heading" className="text-base font-bold text-[var(--color-title)]">
              Datos generales
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <FormField label="Nombre de la empresa" htmlFor="campo-empresa" required>
              <Input
                id="campo-empresa"
                type="text"
                placeholder="Constructora Andina S.A."
                value={data.empresa}
                onChange={(e) => setData((d: any) => ({ ...d, empresa: e.target.value }))}
                prefix={<Building2 size={15} />}
                aria-required="true"
              />
            </FormField>

            <FormField label="Descripción del proyecto" htmlFor="campo-descripcion" required>
              <Textarea
                id="campo-descripcion"
                placeholder="Construcción de infraestructura..."
                value={data.descripcion}
                onChange={(e) => setData((d: any) => ({ ...d, descripcion: e.target.value }))}
                prefix={<FileText size={15} />}
                maxLength={500}
                showCount
                rows={3}
                aria-required="true"
              />
            </FormField>

            <FormField label="Sede a la que va a asistir" htmlFor="campo-sede" required>
              <Select
                id="campo-sede"
                options={SEDES_MOCK}
                placeholder="Selecciona una sede"
                value={data.sede}
                onChange={(e) => setData((d: any) => ({ ...d, sede: e.target.value }))}
                prefix={<MapPin size={15} />}
                aria-required="true"
              />
            </FormField>
          </div>
        </section>

        {/* ── Columna derecha: Datos del solicitante ── */}
        <section className="px-8 py-6" aria-labelledby="datos-solicitante-heading">
          <div className="flex items-center gap-2 mb-5">
            <User size={18} className="text-[var(--color-secondary)]" />
            <h2 id="datos-solicitante-heading" className="text-base font-bold text-[var(--color-title)]">
              Datos del solicitante
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            <FormField label="Nombre completo" htmlFor="campo-nombre-solicitante" required>
              <Input
                id="campo-nombre-solicitante"
                type="text"
                placeholder="Juan Pérez García"
                value={data.nombreSolicitante}
                onChange={(e) => setData((d: any) => ({ ...d, nombreSolicitante: e.target.value }))}
                prefix={<User size={15} />}
                aria-required="true"
              />
            </FormField>

            <FormField label="Celular" htmlFor="campo-celular" required>
              <Input
                id="campo-celular"
                type="text"
                inputMode="numeric"
                maxLength={9}
                placeholder="987654321"
                value={data.celular}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setData((d: any) => ({ ...d, celular: value }));
                }}
                prefix={<Phone size={15} />}
                aria-required="true"
              />
            </FormField>

            <FormField label="Correo" htmlFor="campo-correo" required>
              <Input
                id="campo-correo"
                type="email"
                placeholder="juan.perez@empresa.com"
                value={data.correo}
                onChange={(e) => setData((d: any) => ({ ...d, correo: e.target.value }))}
                prefix={<Mail size={15} />}
                aria-required="true"
              />
            </FormField>
          </div>
        </section>
      </div>

      {/* Divisor */}
      <hr className="border-[var(--color-border)] mx-8" />

      {/* ── Sección clasificación: ancho completo ── */}
      <section className="px-8 py-6" aria-labelledby="clasificacion-heading">
        <div className="flex items-center gap-2 mb-4">
          <ShieldAlert size={18} className="text-[var(--color-secondary)]" />
          <h2 id="clasificacion-heading" className="text-base font-bold text-[var(--color-title)]">
            Clasificación del trabajo
            <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <RiskCard
            value="TAR"
            label="Alto riesgo (TAR)"
            description="Actividades con riesgos significativos para las personas, o instalaciones."
            icon={<AlertTriangle size={22} />}
            variant="danger"
            selected={data.clasificacion === "TAR"}
            onChange={(v) => setData((d: any) => ({ ...d, clasificacion: v as "TAR" }))}
          />
          <RiskCard
            value="NO_TAR"
            label="No alto riesgo (No TAR)"
            description="Actividades con riesgos controlados y procedimientos estándar."
            icon={<CheckCircle2 size={22} />}
            variant="success"
            selected={data.clasificacion === "NO_TAR"}
            onChange={(v) => setData((d: any) => ({ ...d, clasificacion: v as "NO_TAR" }))}
          />
        </div>
      </section>
    </>
  );
}
