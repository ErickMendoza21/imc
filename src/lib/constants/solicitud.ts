export interface Step {
  id: number;
  label: string;
}

/** Obtener los pasos dinámicamente según la clasificación */
export const getStepsNuevaSolicitud = (isTar: boolean): Step[] => {
  const steps: Step[] = [
    { id: 1, label: "Datos de la solicitud" },
    { id: 2, label: "Requisitos Generales" },
    { id: 3, label: "Personal" },
    { id: 4, label: "Carga Masiva" },
    { id: 5, label: "Vehículos" },
  ];
  if (isTar) {
    steps.push({ id: 6, label: "Prevencionista" });
  }
  return steps;
};

/** MOCK — pendiente de integración real */
export const SEDES_MOCK = [
  { value: "sede-principal", label: "Sede Principal" },
  { value: "sede-norte", label: "Sede Norte" },
  { value: "sede-sur", label: "Sede Sur" },
  { value: "sede-este", label: "Sede Este" },
];

export interface TrabajoAltoRiesgo {
  id: string;
  label: string;
  casosEspeciales?: { id: string; label: string }[];
}

export const TRABAJOS_ALTO_RIESGO_MOCK: TrabajoAltoRiesgo[] = [
  {
    id: "altura",
    label: "TRABAJOS EN ALTURA",
    casosEspeciales: [
      { id: "altura_andamio", label: "En caso de usar andamio" },
      { id: "altura_plataforma", label: "En caso de usar Plataforma elevadora" },
    ],
  },
  {
    id: "espacio_confinado",
    label: "ESPACIO CONFINADO",
    casosEspeciales: [
      { id: "espacio_medidor_gas", label: "En caso de usar medidor de gas" },
    ],
  },
  {
    id: "matpel",
    label: "MATERIALES PELIGROSOS MATPEL",
  },
  {
    id: "excavaciones",
    label: "EXCAVACIONES",
  },
  {
    id: "caliente",
    label: "CALIENTE",
  },
  {
    id: "izaje_cargas",
    label: "IZAJE DE CARGAS",
  },
  {
    id: "electricos",
    label: "TRABAJOS ELÉCTRICOS",
    casosEspeciales: [
      { id: "electricos_medicion", label: "En caso de usar equipos de medición" },
    ],
  },
  {
    id: "maquinaria_pesada",
    label: "MAQUINARIA PESADA",
  },
];

export const SERVICES_TAR_MOCK = TRABAJOS_ALTO_RIESGO_MOCK;

