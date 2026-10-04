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
import { getSedesSelectOptions } from "@/lib/services/sedes";
import { StepDatosSolicitud, StepDatosSolicitudData } from "./StepDatosSolicitud";
import { StepRequisitosGenerales, StepRequisitosGeneralesData } from "./StepRequisitosGenerales";
import { StepPersonal, StepPersonalData } from "./StepPersonal";
import { StepCargaMasiva, StepCargaMasivaData } from "./StepCargaMasiva";
import { StepVehiculos, StepVehiculosData } from "./StepVehiculos";
import { StepPrevencionistas, StepPrevencionistasData } from "./StepPrevencionistas";

export interface FormData
  extends StepDatosSolicitudData,
    StepRequisitosGeneralesData,
    StepPersonalData,
    StepCargaMasivaData,
    StepVehiculosData,
    StepPrevencionistasData {}

export function NuevaSolicitudForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [role, setRole] = useState<string | null>(null);
  const [sedesOptions, setSedesOptions] = useState<{ value: string; label: string }[]>([]);

  const [data, setData] = useState<FormData>({
    empresa: "",
    descripcion: "",
    sede: "",
    nombreSolicitante: "",
    celular: "",
    correo: "",
    clasificacion: "",
    serviciosSeleccionados: [],
    casosEspecialesSeleccionados: [],
    requisitos: {},
    fichasEpp: [{ id: "epp-1", nombre: "", archivo: null }],
    especificacionesQuimicos: [{ id: "quim-1", nombre: "", archivo: null }],
    certificadosCalibracion: [{ id: "cal-1", nombre: "", archivo: null, fecha: "" }],
    personal: [],
    cargaMasiva: {},
    vehiculos: [],
    prevencionistas: [],
  });

  useEffect(() => {
    const currentRole = localStorage.getItem("userRole");
    setRole(currentRole);

    // Cargar opciones de sedes (sedes activas) al montar
    setSedesOptions(getSedesSelectOptions());

    // Si es solicitante/contratista, pre-rellenar los datos desde su perfil de usuario
    if (currentRole === "solicitante") {
      const username = localStorage.getItem("username");
      const selectedSede = localStorage.getItem("selectedSede") || "";
      if (username) {
        const usuario = getUsuarioByUsername(username);
        if (usuario) {
          setData((prev) => ({
            ...prev,
            empresa: usuario.empresa,
            descripcion: usuario.descripcion,
            sede: selectedSede || prev.sede,
            nombreSolicitante: usuario.nombreCompleto,
            celular: usuario.celular,
            correo: usuario.correo,
          }));
        }
      }
    }

    // Refrescar sedes si el admin las modifica en otra pestaña
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "imc_sedes") {
        setSedesOptions(getSedesSelectOptions());
      }
    };

    // Refrescar sedes cuando el usuario vuelve a este tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setSedesOptions(getSedesSelectOptions());
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
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
    const baseReqs = ["iperc", "difusion_iperc", "directorio", "matriz_aspectos"];
    const tarExtras = ["pets", "difusion_pets", "plan_emergencia", "lista_epp"];
    let requiredIds = isTar ? [...baseReqs, ...tarExtras] : [...baseReqs];
    const sinFechaRequerida = ["lista_epp"];

    if (isTar) {
      if ((data.casosEspecialesSeleccionados || []).includes("altura_andamio")) {
        requiredIds.push("ensayo_andamio");
      }
      if ((data.casosEspecialesSeleccionados || []).includes("altura_plataforma")) {
        requiredIds.push("cert_operatividad_plataforma");
        requiredIds.push("seguro_resp_civil");
      }
    }

    // 1. Validar documentos base
    const baseOk = requiredIds.every((id) => {
      const req = data.requisitos[id];
      if (!req?.archivo) return false;
      if (!sinFechaRequerida.includes(id) && !req?.fechaEmision) return false;
      return true;
    });

    if (!baseOk) return false;

    // 2. Fichas de EPP (uno o más): si es TAR, al menos 1 archivo cargado
    if (isTar) {
      const hasValidEpp = (data.fichasEpp || []).some((item) => item.archivo !== null);
      if (!hasValidEpp) return false;
    }

    // 3. Especificaciones de químicos (uno o más): si se seleccionó MATPEL
    const isMatpel = (data.serviciosSeleccionados || []).includes("matpel");
    if (isMatpel) {
      const hasValidQuim = (data.especificacionesQuimicos || []).some((item) => item.archivo !== null);
      if (!hasValidQuim) return false;
    }

    // 4. Certificados de calibración (uno o más): si se seleccionó medidor de gas o medición
    const isMedicion = (data.casosEspecialesSeleccionados || []).some((c) =>
      ["espacio_medidor_gas", "electricos_medicion"].includes(c)
    );
    if (isMedicion) {
      const hasValidCal = (data.certificadosCalibracion || []).some(
        (item) => item.archivo !== null && Boolean(item.fecha)
      );
      if (!hasValidCal) return false;
    }

    return true;
  };

  const isStep3Valid = () => {
    return (data.personal || []).length > 0;
  };

  const isStep4Valid = () => {
    const docsBase = ["sctr", "samo", "iperc"];
    const docsParaValidar = isTar ? [...docsBase, "pets"] : docsBase;
    const totalPersonal = data.personal || [];
    if (totalPersonal.length === 0) return false;

    return docsParaValidar.every((docId) => {
      const filesArr = data.cargaMasiva[docId];
      if (!Array.isArray(filesArr) || filesArr.length === 0) return false;

      const coveredIds = new Set<string>();

      for (const item of filesArr) {
        if (!item.archivo) return false;
        if (docId !== "sctr" && !item.fechaEmision) return false;
        if (!item.personalIds || item.personalIds.length === 0) return false;
        item.personalIds.forEach((id: string) => coveredIds.add(id));
      }

      // Debe cubrir a absolutamente todos los trabajadores registrados
      return totalPersonal.every((p: any) => coveredIds.has(p.id));
    });
  };

  const isStep5Valid = () => {
    const vehiculos = data.vehiculos || [];
    if (vehiculos.length === 0) return true; // Opcional
    return vehiculos.every((v: any) =>
      v.soatArchivoNombre &&
      v.soatFechaEmision &&
      v.citvArchivoNombre &&
      v.citvFechaEmision &&
      v.tarjetaPropiedadArchivoNombre &&
      v.conductores?.length > 0 &&
      v.conductores.every((c: any) => c.licenciaArchivoNombre && c.licenciaFechaVencimiento)
    );
  };

  const isStep6Valid = () => {
    if (!isTar) return true;
    const prevs = data.prevencionistas || [];
    if (prevs.length === 0) return false;
    // Todos los TAR deben estar cubiertos
    const tarCubiertos = new Set(prevs.flatMap((p: any) => p.tarAsignados));
    const servicios = data.serviciosSeleccionados || [];
    const todosCubiertos = servicios.every((s: string) => tarCubiertos.has(s));
    if (!todosCubiertos) return false;
    // Cada prevencionista debe tener todos sus documentos
    return prevs.every((p: any) =>
      p.personaId &&
      p.tarAsignados.length > 0 &&
      p.formacionAcademicaArchivoNombre &&
      p.certificadoTrabajoArchivoNombre &&
      p.certsCapacitacion.length === p.tarAsignados.length &&
      p.certsCapacitacion.every((c: any) => c.archivoNombre && c.fechaEmision)
    );
  };

  const isCurrentStepValid = () => {
    if (currentStep === 1) return isStep1Valid();
    if (currentStep === 2) return isStep2Valid();
    if (currentStep === 3) return isStep3Valid();
    if (currentStep === 4) return isStep4Valid();
    if (currentStep === 5) return isStep5Valid();
    return isStep6Valid();
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

    const fichasEppSaved = (data.fichasEpp || [])
      .filter((e) => e.archivo)
      .map((e) => ({
        id: e.id,
        nombre: e.nombre || "Ficha EPP",
        archivoNombre: e.archivo?.name,
      }));

    const especificacionesQuimicosSaved = (data.especificacionesQuimicos || [])
      .filter((q) => q.archivo)
      .map((q) => ({
        id: q.id,
        nombre: q.nombre || "Químico",
        archivoNombre: q.archivo?.name,
      }));

    const certificadosCalibracionSaved = (data.certificadosCalibracion || [])
      .filter((c) => c.archivo)
      .map((c) => ({
        id: c.id,
        nombre: c.nombre || "Equipo de medición",
        archivoNombre: c.archivo?.name,
        fecha: c.fecha,
      }));

    const payload = {
      empresa: data.empresa,
      descripcion: data.descripcion,
      sede: data.sede,
      nombreSolicitante: data.nombreSolicitante,
      celular: data.celular,
      correo: data.correo,
      clasificacion: data.clasificacion,
      serviciosSeleccionados: data.serviciosSeleccionados,
      casosEspecialesSeleccionados: data.casosEspecialesSeleccionados,
      requisitosArchivos,
      requisitosFechas,
      fichasEpp: fichasEppSaved,
      especificacionesQuimicos: especificacionesQuimicosSaved,
      certificadosCalibracion: certificadosCalibracionSaved,
      personal: data.personal,
      cargaMasiva: data.cargaMasiva,
      vehiculos: data.vehiculos,
      prevencionistas: data.prevencionistas,
    };

    const nuevaSolicitud = saveSolicitud({
      ...payload,
      creadoPor: localStorage.getItem("username") || "contratista",
    });

    Swal.fire({
      icon: "success",
      title: "Solicitud registrada",
      html: `La solicitud ha sido registrada con éxito.<br><br>Código asignado: <strong style="font-family:monospace;color:var(--color-primary);background:var(--color-primary-light);padding:3px 8px;border-radius:4px;font-size:1.05rem">${nuevaSolicitud.codigo}</strong>`,
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
            {currentStep === 1 && <StepDatosSolicitud data={data} setData={setData} sedesOptions={sedesOptions} />}
            {currentStep === 2 && <StepRequisitosGenerales data={data} setData={setData} />}
            {currentStep === 3 && <StepPersonal data={data} setData={setData} />}
            {currentStep === 4 && <StepCargaMasiva data={data} setData={setData} />}
            {currentStep === 5 && <StepVehiculos data={data} setData={setData} />}
            {currentStep === 6 && <StepPrevencionistas data={data} setData={setData} />}
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
