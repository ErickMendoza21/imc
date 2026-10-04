import { Building2, FileText, MapPin, User, Phone, Mail, ShieldAlert, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useEffect, useState } from "react";
import { FormField } from "@/components/molecules/FormField";
import { Input } from "@/components/atoms/Input";
import { Select } from "@/components/atoms/Select";
import { Textarea } from "@/components/atoms/Textarea";
import { RiskCard } from "@/components/molecules/RiskCard";
import { TRABAJOS_ALTO_RIESGO_MOCK } from "@/lib/constants/solicitud";

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
  sedesOptions: { value: string; label: string }[];
}

export function StepDatosSolicitud({ data, setData, sedesOptions }: StepDatosSolicitudProps) {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    setRole(localStorage.getItem("userRole"));
  }, []);

  const isSolicitante = role === "solicitante";
  const isAdmin = role === "admin";

  return (
      <div className="flex flex-col gap-8 max-w-4xl mx-auto py-4">
        {/* ── Sección Sede ── */}
        <section aria-labelledby="sede-heading">
          <div className="flex items-center gap-2 mb-3">
            <MapPin size={18} className="text-[var(--color-secondary)]" />
            <h2 id="sede-heading" className="text-base font-bold text-[var(--color-title)]">
              Sede a la que va a asistir
              <span className="text-[var(--color-danger)] ml-0.5" aria-hidden="true">*</span>
            </h2>
          </div>
          <div className="max-w-md">
            <FormField label="Selecciona la sede" htmlFor="solicitud-sede" required>
              <Select
                id="solicitud-sede"
                options={sedesOptions}
                placeholder="Seleccione una sede"
                value={data.sede || ""}
                onChange={(e) => setData((d: any) => ({ ...d, sede: e.target.value }))}
                prefix={<MapPin size={15} />}
              />
            </FormField>
          </div>
        </section>

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

        {/* ── Lista de Trabajos de Alto Riesgo ── */}
        {data.clasificacion && (
          <section className="bg-white border border-[var(--color-border)] rounded-xl p-6 shadow-sm [animation:card-in_0.3s_ease-out_both]">
            <div className="flex flex-col mb-4">
              <h3 className="text-[0.95rem] font-semibold text-[var(--color-title)]">
                Trabajos de alto riesgo
              </h3>
              <p className="text-sm text-[var(--color-text-secondary)]">
                Seleccione uno o más trabajos de alto riesgo que correspondan a su solicitud.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {TRABAJOS_ALTO_RIESGO_MOCK.map((trabajo) => {
                const isSelected = data.serviciosSeleccionados?.includes(trabajo.id);

                return (
                  <div
                    key={trabajo.id}
                    className={`
                      relative flex flex-col p-4 rounded-lg border transition-all duration-200
                      ${isSelected
                        ? "border-[var(--color-secondary)] bg-[var(--color-primary-light)]/30 ring-1 ring-[var(--color-secondary)]"
                        : "border-[var(--color-border)] bg-white hover:border-[var(--color-secondary)]/50 hover:bg-[var(--color-bg-soft)]"
                      }
                    `}
                  >
                    <label className="flex items-center cursor-pointer w-full select-none">
                      <div className="flex items-center h-5">
                        <input
                          type="checkbox"
                          className="w-4 h-4 text-[var(--color-secondary)] border-gray-300 rounded focus:ring-[var(--color-secondary)] cursor-pointer"
                          checked={isSelected || false}
                          onChange={(e) => {
                            const currentSelected = data.serviciosSeleccionados || [];
                            const currentCasos = data.casosEspecialesSeleccionados || [];
                            const casosIds = (trabajo.casosEspeciales || []).map((c) => c.id);
                            let newSelected: string[];
                            let newCasos = [...currentCasos];

                            if (e.target.checked) {
                              newSelected = [...currentSelected, trabajo.id];
                            } else {
                              newSelected = currentSelected.filter((id: string) => id !== trabajo.id);
                              // Si desmarca el trabajo, desmarcamos también sus casos especiales
                              newCasos = newCasos.filter((id: string) => !casosIds.includes(id));
                            }

                            setData((d: any) => ({
                              ...d,
                              serviciosSeleccionados: newSelected,
                              casosEspecialesSeleccionados: newCasos,
                            }));
                          }}
                        />
                      </div>
                      <div className="ml-3 flex flex-col justify-center">
                        <span className={`text-sm font-semibold tracking-wide ${isSelected ? "text-[var(--color-title)]" : "text-[var(--color-title)]/80"}`}>
                          {trabajo.label}
                        </span>
                      </div>
                    </label>

                    {/* Checkboxes para casos especiales cuando el TAR está seleccionado */}
                    {isSelected && trabajo.casosEspeciales && trabajo.casosEspeciales.length > 0 && (
                      <div className="flex flex-col gap-2 mt-3 ml-7 pt-2.5 border-t border-[var(--color-border)]/70">
                        <span className="text-[11px] font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                          Casos especiales:
                        </span>
                        {trabajo.casosEspeciales.map((caso) => {
                          const isCasoSelected = (data.casosEspecialesSeleccionados || []).includes(caso.id);

                          return (
                            <label
                              key={caso.id}
                              className="flex items-start gap-2.5 p-2 bg-white/80 rounded-lg border border-[var(--color-border)] cursor-pointer hover:bg-white transition-colors"
                            >
                              <div className="flex items-center h-4 mt-0.5">
                                <input
                                  type="checkbox"
                                  className="w-3.5 h-3.5 text-[var(--color-warning)] border-gray-300 rounded focus:ring-[var(--color-warning)] cursor-pointer"
                                  checked={isCasoSelected}
                                  onChange={(e) => {
                                    const currentCasos = data.casosEspecialesSeleccionados || [];
                                    let newCasos: string[];

                                    if (e.target.checked) {
                                      newCasos = [...currentCasos, caso.id];
                                    } else {
                                      newCasos = currentCasos.filter((id: string) => id !== caso.id);
                                    }

                                    setData((d: any) => ({
                                      ...d,
                                      casosEspecialesSeleccionados: newCasos,
                                    }));
                                  }}
                                />
                              </div>
                              <span className="text-xs text-[var(--color-text-secondary)] flex items-center gap-1.5 font-medium">
                                <AlertTriangle size={12} className="text-[var(--color-warning)] flex-shrink-0" />
                                {caso.label}
                              </span>
                            </label>
                          );
                        })}
                      </div>
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
