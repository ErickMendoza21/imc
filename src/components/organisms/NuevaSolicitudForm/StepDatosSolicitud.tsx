import { Building2, FileText, MapPin, User, Phone, Mail, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { RiskCard } from "@/components/molecules/RiskCard";
import { SEDES_MOCK, SERVICES_TAR_MOCK } from "@/lib/constants/solicitud";

export interface StepDatosSolicitudData {
  empresa: string;
  descripcion: string;
  sede: string;
  nombreSolicitante: string;
  celular: string;
  correo: string;
  clasificacion: "TAR" | "NO_TAR" | "";
  serviciosSeleccionados?: string[];
  casosEspecialesSeleccionados?: string[];
}

interface StepDatosSolicitudProps {
  data: StepDatosSolicitudData;
  setData: React.Dispatch<React.SetStateAction<any>>;
}

export function StepDatosSolicitud({ data, setData }: StepDatosSolicitudProps) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  const isSolicitante = role === "solicitante";
  const isAdmin = role === "admin";

  return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
        {/* ── Sección clasificación ── */}
        <section aria-labelledby="clasificacion-heading">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert size={18} className="text-[var(--color-secondary)]" />
            <h2 id="clasificacion-heading" className="text-base font-bold text-[var(--color-title)]">
              Clasificación del trabajo
              <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
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

        {/* ── Lista de Servicios ── */}
        {data.clasificacion && (
          <section className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm [animation:card-in_0.3s_ease-out_both]">
            <div className="flex flex-col mb-4">
              <h3 className="text-[0.95rem] font-semibold text-[var(--color-title)]">
                Seleccione los servicios a solicitar
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Puede seleccionar uno o más servicios. Algunos requerirán consideraciones especiales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {SERVICES_TAR_MOCK.map((servicio) => {
                const isSelected = data.serviciosSeleccionados?.includes(servicio.id);
                const isCasoSelected = data.casosEspecialesSeleccionados?.includes(servicio.id);

                return (
                  <div
                    key={servicio.id}
                    className={`
                      relative flex flex-col p-4 rounded-lg border transition-all duration-200
                      ${isSelected
                        ? "border-[var(--color-secondary)] bg-[var(--color-primary-light)]/30 ring-1 ring-[var(--color-secondary)]"
                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-secondary)]/50 hover:bg-[var(--color-bg-soft)]"
                      }
                    `}
                  >
                    <label className="flex items-start cursor-pointer w-full">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[var(--color-secondary)] border-gray-300 rounded focus:ring-[var(--color-secondary)] cursor-pointer"
                          checked={isSelected || false}
                          onChange={(e) => {
                            const currentSelected = data.serviciosSeleccionados || [];
                            const currentCasos = data.casosEspecialesSeleccionados || [];
                            let newSelected;
                            let newCasos = [...currentCasos];

                            if (e.target.checked) {
                              newSelected = [...currentSelected, servicio.id];
                            } else {
                              newSelected = currentSelected.filter((id: string) => id !== servicio.id);
                              // Si desmarca el servicio, también desmarcamos su caso especial si lo tenía
                              newCasos = newCasos.filter((id: string) => id !== servicio.id);
                            }

                            setData((d: any) => ({
                              ...d,
                              serviciosSeleccionados: newSelected,
                              casosEspecialesSeleccionados: newCasos
                            }));
                          }}
                        />
                      </div>
                      <div className="ml-3 flex flex-col justify-center h-5">
                        <span className={`text-sm font-medium ${isSelected ? "text-[var(--color-title)]" : "text-[var(--color-title)]/80"}`}>
                          {servicio.label}
                        </span>
                      </div>
                    </label>

                    {/* Checkbox anidado para el caso especial (solo visible si el servicio está seleccionado y tiene caso especial) */}
                    {isSelected && servicio.casoEspecial && (
                      <label className="flex items-start cursor-pointer mt-3 ml-7 p-2 bg-white/60 rounded border border-[var(--color-border)]">
                        <div className="flex items-center h-5">
                          <input
                            type="checkbox"
                            className="w-3.5 h-3.5 text-[var(--color-warning)] border-gray-300 rounded focus:ring-[var(--color-warning)] cursor-pointer"
                            checked={isCasoSelected || false}
                            onChange={(e) => {
                              const currentCasos = data.casosEspecialesSeleccionados || [];
                              let newCasos;
                              if (e.target.checked) {
                                newCasos = [...currentCasos, servicio.id];
                              } else {
                                newCasos = currentCasos.filter((id: string) => id !== servicio.id);
                              }
                              setData((d: any) => ({ ...d, casosEspecialesSeleccionados: newCasos }));
                            }}
                          />
                        </div>
                        <div className="ml-2 flex flex-col">
                          <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium">
                            <AlertTriangle size={12} className="text-[var(--color-warning)]" />
                            {servicio.casoEspecial}
                          </span>
                        </div>
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
  );
}
