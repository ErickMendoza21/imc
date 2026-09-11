"use client";

import { useState, FormEvent, useMemo } from "react";
import { FilePlus2, ChevronRight, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/atoms/Button";
import { Stepper } from "@/components/molecules/Stepper";

import { getStepsNuevaSolicitud } from "@/lib/constants/solicitud";
import { StepDatosSolicitud, StepDatosSolicitudData } from "./StepDatosSolicitud";
import { StepRequisitosTAR, StepRequisitosTARData } from "./StepRequisitosTAR";

export interface FormData extends StepDatosSolicitudData, StepRequisitosTARData {}

export function NuevaSolicitudForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<FormData>({
    empresa: "",
    descripcion: "",
    sede: "",
    nombreSolicitante: "",
    celular: "",
    correo: "",
    clasificacion: "",
    requisitos: {},
  });

  const isTar = data.clasificacion === "TAR";
  const dynamicSteps = useMemo(() => getStepsNuevaSolicitud(isTar), [isTar]);
  const totalSteps = dynamicSteps.length;

  const isStep1Valid =
    data.empresa.trim() !== "" &&
    data.descripcion.trim() !== "" &&
    data.sede !== "" &&
    data.nombreSolicitante.trim() !== "" &&
    data.celular.trim() !== "" &&
    data.correo.trim() !== "" &&
    data.clasificacion !== "";

  const isStep2Valid = isTar
    ? ["pets", "programa", "iperc", "otros"].every(
        (id) => data.requisitos[id]?.archivo && data.requisitos[id]?.fechaEmision
      )
    : true; // si no es TAR, el paso 2 (si existiera) o el step que sea se asume válido o no aplica este chequeo.

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid;
    if (currentStep === 2 && isTar) return isStep2Valid;
    return true; // para el paso 3 o si no es TAR
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      handleSubmit();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = () => {
    // MOCK — lógica de envío final pendiente de integración real
    Swal.fire({
      icon: "success",
      title: "Solicitud registrada",
      text: "La solicitud ha sido registrada con éxito.",
      confirmButtonColor: "var(--color-primary)",
    });
  };

  const handleCancel = () => {
    Swal.fire({
      icon: "warning",
      title: "¿Cancelar registro?",
      text: "Perderás los datos ingresados en esta solicitud.",
      showCancelButton: true,
      confirmButtonText: "Sí, cancelar",
      cancelButtonText: "Volver",
      confirmButtonColor: "var(--color-danger)",
      cancelButtonColor: "var(--color-primary)",
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* ── Encabezado de página ── */}
      <div className="flex items-center gap-4">
        <div className="p-3 bg-[var(--color-primary-light)] rounded-xl">
          <FilePlus2 size={28} className="text-[var(--color-primary)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-title)] leading-tight">
            Registrar nueva solicitud
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] mt-0.5">
            Completa la información requerida para registrar una nueva solicitud de servicio.
          </p>
        </div>
      </div>

      {/* ── Formulario ── */}
      <div className="flex flex-col gap-4">
        {/* Card contenedora */}
        <div className="bg-white border border-[var(--color-border)] rounded-xl shadow-[var(--shadow-card)] overflow-hidden">
          {/* Stepper */}
          <div className="px-8 py-5 border-b border-[var(--color-border)]">
            <Stepper steps={dynamicSteps} currentStep={currentStep} />
          </div>

          {/* Renderizado dinámico de pasos */}
          <div className="min-h-[300px]">
            {currentStep === 1 && <StepDatosSolicitud data={data} setData={setData} />}
            {currentStep === 2 && isTar && <StepRequisitosTAR data={data} setData={setData} />}
            {currentStep === 2 && !isTar && (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                Resumen de la solicitud (No TAR) - En construcción
              </div>
            )}
            {currentStep === 3 && isTar && (
              <div className="p-8 text-center text-[var(--color-text-secondary)]">
                Resumen de la solicitud (TAR) - En construcción
              </div>
            )}
          </div>
        </div>

        {/* ── Botones de navegación ── */}
        <div className="flex justify-between gap-3 items-center">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            className="w-auto"
          >
            Cancelar
          </Button>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <Button type="button" variant="outline" onClick={handleBack} className="w-auto">
                <ChevronLeft size={16} />
                Anterior
              </Button>
            )}
            <Button
              type="button"
              variant="primary"
              disabled={!isCurrentStepValid()}
              onClick={handleNext}
              className="w-auto"
            >
              {currentStep === totalSteps ? "Finalizar" : "Siguiente"}
              {currentStep < totalSteps && <ChevronRight size={16} />}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
