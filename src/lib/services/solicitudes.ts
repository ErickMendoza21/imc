/**
 * Servicio de persistencia de solicitudes en localStorage.
 * MOCK — pendiente de integración real con API/backend.
 */

export interface DocumentoMultiSaved {
  id: string;
  nombre: string;
  archivoNombre?: string;
  fecha?: string;
}

export interface Solicitud {
  id: string;
  codigo: string;
  empresa: string;
  descripcion: string;
  sede: string;
  nombreSolicitante: string;
  celular: string;
  correo: string;
  clasificacion: "TAR" | "NO_TAR" | "";
  serviciosSeleccionados?: string[];
  casosEspecialesSeleccionados?: string[];
  /** Nombres de archivos adjuntos (los File no se serializan) */
  requisitosArchivos: Record<string, string>;
  requisitosFechas: Record<string, string>;
  fichasEpp?: DocumentoMultiSaved[];
  especificacionesQuimicos?: DocumentoMultiSaved[];
  certificadosCalibracion?: DocumentoMultiSaved[];
  creadoPor: string;
  fechaCreacion: string;
  estado: "Pendiente" | "Aprobada" | "Rechazada";
  personal?: any[]; // Array of personnel data
  cargaMasiva?: any;
  vehiculos?: Array<{ id: string; placa: string; marca: string; color: string }>;
}

const STORAGE_KEY = "imc_solicitudes";

/** Genera un código correlativo único en formato SOL-YYYY-XXXX */
export function generateCodigoSolicitud(solicitudes: Solicitud[]): string {
  const year = new Date().getFullYear();
  const prefix = `SOL-${year}-`;

  const existingNums = solicitudes
    .map((s) => s.codigo)
    .filter((c) => Boolean(c) && c.startsWith(prefix))
    .map((c) => {
      const numStr = c.replace(prefix, "");
      const n = parseInt(numStr, 10);
      return isNaN(n) ? 0 : n;
    });

  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
  let code = `${prefix}${String(nextNum).padStart(4, "0")}`;

  let counter = nextNum;
  while (solicitudes.some((s) => s.codigo === code)) {
    counter++;
    code = `${prefix}${String(counter).padStart(4, "0")}`;
  }

  return code;
}

/** Obtener todas las solicitudes guardadas */
export function getSolicitudes(): Solicitud[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Solicitud[];
    let hasMigration = false;
    const year = new Date().getFullYear();
    const migrated = parsed.map((s, idx) => {
      if (!s.codigo) {
        hasMigration = true;
        return {
          ...s,
          codigo: `SOL-${year}-${String(idx + 1).padStart(4, "0")}`,
        };
      }
      return s;
    });

    if (hasMigration) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
    }
    return migrated;
  } catch {
    return [];
  }
}

/** Guardar una nueva solicitud */
export function saveSolicitud(
  solicitud: Omit<Solicitud, "id" | "codigo" | "fechaCreacion" | "estado">
): Solicitud {
  const solicitudes = getSolicitudes();
  const codigo = generateCodigoSolicitud(solicitudes);
  const nueva: Solicitud = {
    ...solicitud,
    id: crypto.randomUUID(),
    codigo,
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
