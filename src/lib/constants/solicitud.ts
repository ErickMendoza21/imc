export interface Step {
  id: number;
  label: string;
}

/** Obtener los pasos dinámicamente según la clasificación */
export const getStepsNuevaSolicitud = (isTar: boolean): Step[] => {
  if (isTar) {
    return [
      { id: 1, label: "Datos de la solicitud" },
      { id: 2, label: "Requisitos TAR" },
      { id: 3, label: "Resumen" },
    ];
  }
  return [
    { id: 1, label: "Datos de la solicitud" },
    { id: 2, label: "Resumen" },
  ];
};

/** MOCK — pendiente de integración real */
export const SEDES_MOCK = [
  { value: "sede-principal", label: "Sede Principal" },
  { value: "sede-norte",     label: "Sede Norte"     },
  { value: "sede-sur",       label: "Sede Sur"       },
  { value: "sede-este",      label: "Sede Este"      },
];
