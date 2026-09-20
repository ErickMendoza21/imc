/**
 * Servicio de persistencia de solicitudes en localStorage.
 * MOCK — pendiente de integración real con API/backend.
 */

export interface Solicitud {
  id: string;
  empresa: string;
  descripcion: string;
  sede: string;
  nombreSolicitante: string;
  celular: string;
  correo: string;
  clasificacion: "TAR" | "NO_TAR" | "";
  /** Nombres de archivos adjuntos (los File no se serializan) */
  requisitosArchivos: Record<string, string>;
  requisitosFechas: Record<string, string>;
  creadoPor: string;
  fechaCreacion: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  personal?: any[]; // Array of personnel data
}

const STORAGE_KEY = "imc_solicitudes";

/** Obtener todas las solicitudes guardadas */
export function getSolicitudes(): Solicitud[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Solicitud[];
  } catch {
    return [];
  }
}

/** Guardar una nueva solicitud */
export function saveSolicitud(solicitud: Omit<Solicitud, "id" | "fechaCreacion" | "estado">): Solicitud {
  const solicitudes = getSolicitudes();
  const nueva: Solicitud = {
    ...solicitud,
    id: crypto.randomUUID(),
    fechaCreacion: new Date().toISOString(),
    estado: "Pendiente",
  };
  solicitudes.push(nueva);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
  return nueva;
}

/** Actualizar una solicitud existente */
export function updateSolicitud(id: string, updates: Partial<Solicitud>): Solicitud | null {
  const solicitudes = getSolicitudes();
  const index = solicitudes.findIndex((s) => s.id === id);
  if (index === -1) return null;

  const actualizada = { ...solicitudes[index], ...updates };
  solicitudes[index] = actualizada;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(solicitudes));
  return actualizada;
}
