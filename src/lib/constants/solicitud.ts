export interface Step {
  id: number;
  label: string;
}

/** Obtener los pasos dinámicamente según la clasificación */
export const getStepsNuevaSolicitud = (isTar: boolean): Step[] => {
  if (isTar) {
    return [
      { id: 1, label: "Datos de la solicitud" },
      { id: 2, label: "Requisitos Generales" },
      { id: 3, label: "Personal" },
      { id: 4, label: "Carga Masiva" },
    ];
  }
  return [
    { id: 1, label: "Datos de la solicitud" },
    { id: 2, label: "Requisitos Generales" },
    { id: 3, label: "Personal" },
    { id: 4, label: "Carga Masiva" },
  ];
};

/** MOCK — pendiente de integración real */
export const SEDES_MOCK = [
  { value: "sede-principal", label: "Sede Principal" },
  { value: "sede-norte", label: "Sede Norte" },
  { value: "sede-sur", label: "Sede Sur" },
  { value: "sede-este", label: "Sede Este" },
];

export const SERVICES_TAR_MOCK = [
  { id: "s1", label: "Servicio 1", casoEspecial: "En caso de usar grúas" },
  { id: "s2", label: "Servicio 2", casoEspecial: "En caso de usar elevadores de personas" },
  { id: "s3", label: "Servicio 3", casoEspecial: "En caso de usar maquinaria pesada" },
  { id: "s4", label: "Servicio 4", casoEspecial: "En caso de andamio" },
  { id: "s5", label: "Servicio 5", casoEspecial: "En caso de equipos de sustancias químicas" },
  { id: "s6", label: "Servicio 6", casoEspecial: "En caso de equipos de medición" },
  { id: "s7", label: "Servicio 7", casoEspecial: null },
];
