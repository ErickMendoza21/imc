"use client";

import { useState, FormEvent, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { FilePlus2, ChevronRight, ChevronLeft } from "lucide-react";
import Swal from "sweetalert2";

import { Button } from "@/components/atoms/Button";
import { Stepper } from "@/components/molecules/Stepper";

import { getStepsNuevaSolicitud } from "@/lib/constants/solicitud";
import { saveSolicitud } from "@/lib/services/solicitudes";
import { getUsuarioByUsername } from "@/lib/services/usuarios";
import { StepDatosSolicitud, StepDatosSolicitudData } from "./StepDatosSolicitud";
import { StepRequisitosGenerales, StepRequisitosGeneralesData } from "./StepRequisitosGenerales";
import { StepPersonal, StepPersonalData } from "./StepPersonal";
import { StepCargaMasiva, StepCargaMasivaData } from "./StepCargaMasiva";

export interface FormData extends StepDatosSolicitudData, StepRequisitosGeneralesData, StepPersonalData, StepCargaMasivaData {}

export function NuevaSolicitudForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<string | null>(null);

  const [data, setData] = useState<FormData>({
    empresa: "",
    descripcion: "",
    sede: "",
    nombreSolicitante: "",
    celular: "",
    correo: "",
    clasificacion: "",
    requisitos: {},
    personal: [],
    cargaMasiva: {},
  });

  useEffect(() => {
    const currentRole = localStorage.getItem("userRole");
    setRole(currentRole);

    // Si es solicitante, pre-rellenar los datos desde su perfil de usuario
    if (currentRole === "solicitante") {
      const username = localStorage.getItem("username");
      if (username) {
        const usuario = getUsuarioByUsername(username);
        if (usuario) {
          setData((prev) => ({
            ...prev,
            empresa: usuario.empresa,
            descripcion: usuario.descripcion,
            sede: usuario.sede,
            nombreSolicitante: usuario.nombreCompleto,
            celular: usuario.celular,
            correo: usuario.correo,
          }));
        }
      }
    }
  }, []);

  const isSolicitante = role === "solicitante";

  const isTar = data.clasificacion === "TAR";
  const dynamicSteps = useMemo(() => getStepsNuevaSolicitud(isTar), [isTar]);
  const totalSteps = dynamicSteps.length;

  const isStep1Valid = () => {
    const baseValid =
      data.empresa.trim() !== "" &&
      data.descripcion.trim() !== "" &&
      data.sede !== "" &&
      data.nombreSolicitante.trim() !== "" &&
      data.celular.trim() !== "" &&
      data.correo.trim() !== "" &&
      data.clasificacion !== "";

    if (!baseValid) return false;
    
    // Tanto para TAR como NO_TAR se deben listar y requerir servicios
    return (data.serviciosSeleccionados || []).length > 0;
  };

  const isStep2Valid = () => {
    const requiredIds = isTar
      ? ["personal", "iperc", "directorio", "matriz_aspectos", "pets", "plan_emergencia", "lista_epp", "fichas_epp"]
      : ["personal", "iperc", "directorio", "matriz_aspectos"];
    
    return requiredIds.every((id) => {
      const req = data.requisitos[id];
      if (!req?.archivo) return false;
      if (id !== "personal" && id !== "lista_epp" && id !== "fichas_epp" && !req?.fechaEmision) return false;
      return true;
    });
  };

  const isStep3Valid = () => {
    return (data.personal || []).length > 0;
  };

  const isStep4Valid = () => {
    const docsBase = ["sctr", "samo", "iperc"];
    const docsParaValidar = isTar ? [...docsBase, "pets"] : docsBase;

    return docsParaValidar.every(id => {
      const doc = data.cargaMasiva[id];
      if (!doc?.archivo) return false;
      if (id !== "sctr" && !doc?.fechaEmision) return false;
      if (!doc.personalIds || doc.personalIds.length === 0) return false;
      return true;
    });
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    if (currentStep === 3) return isStep3Valid();
    return isStep4Valid();
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
    // MOCK — persistencia en localStorage, pendiente de integración real con API
    const requisitosArchivos: Record<string, string> = {};
    const requisitosFechas: Record<string, string> = {};
    for (const [id, req] of Object.entries(data.requisitos)) {
      if (req.archivo) requisitosArchivos[id] = req.archivo.name;
      if (req.fechaEmision) requisitosFechas[id] = req.fechaEmision;
    }

    const payload = {
      empresa: data.empresa,
      descripcion: data.descripcion,
      sede: data.sede,
      nombreSolicitante: data.nombreSolicitante,
      celular: data.celular,
      correo: data.correo,
      clasificacion: data.clasificacion,
      requisitosArchivos,
      requisitosFechas,
      personal: data.personal,
      cargaMasiva: data.cargaMasiva,
    };

    saveSolicitud({ ...payload, creadoPor: localStorage.getItem("username") || "solicitante" });

    Swal.fire({
      icon: "success",
      title: "Solicitud registrada",
      text: "La solicitud ha sido registrada con éxito.",
      confirmButtonColor: "var(--color-primary)",
    }).then(() => {
      router.push("/mis-solicitudes");
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
    }).then((result) => {
      if (result.isConfirmed) {
        router.push("/inicio");
      }
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
            {currentStep === 2 && <StepRequisitosGenerales data={data} setData={setData} />}
            {currentStep === 3 && <StepPersonal data={data} setData={setData} />}
            {currentStep === 4 && <StepCargaMasiva data={data} setData={setData} />}
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
