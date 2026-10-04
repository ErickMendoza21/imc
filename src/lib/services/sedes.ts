/**
 * Servicio de persistencia y gestión de Sedes en localStorage.
 * MOCK — pendiente de integración real con API/backend.
 */

export interface Sede {
  id: string;
  codigo: string;
  nombre: string;
  direccion?: string;
  descripcion?: string;
  activo: boolean;
  fechaCreacion: string;
}

const STORAGE_KEY = "imc_sedes";

const INITIAL_SEDES: Sede[] = [
  {
    id: "sede-principal",
    codigo: "SED-001",
    nombre: "Sede Principal",
    direccion: "Av. Central 123, Lima",
    descripcion: "Sede central de operaciones y administración.",
    activo: true,
    fechaCreacion: new Date("2026-01-01T08:00:00Z").toISOString(),
  },
  {
    id: "sede-norte",
    codigo: "SED-002",
    nombre: "Sede Norte",
    direccion: "Carretera Panamericana Norte Km 25",
    descripcion: "Planta y almacén de operaciones norte.",
    activo: true,
    fechaCreacion: new Date("2026-01-01T08:00:00Z").toISOString(),
  },
  {
    id: "sede-sur",
    codigo: "SED-003",
    nombre: "Sede Sur",
    direccion: "Av. Industrial 450, Lurín",
    descripcion: "Centro logístico y talleres del sur.",
    activo: true,
    fechaCreacion: new Date("2026-01-01T08:00:00Z").toISOString(),
  },
  {
    id: "sede-este",
    codigo: "SED-004",
    nombre: "Sede Este",
    direccion: "Av. Las Torres 780, Ate",
    descripcion: "Estación de mantenimiento este.",
    activo: true,
    fechaCreacion: new Date("2026-01-01T08:00:00Z").toISOString(),
  },
];

/** Obtener todas las sedes guardadas (o iniciales) */
export function getSedes(incluirInactivas = true): Sede[] {
  if (typeof window === "undefined") return INITIAL_SEDES;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_SEDES));
    return incluirInactivas ? INITIAL_SEDES : INITIAL_SEDES.filter((s) => s.activo);
  }
  try {
    const parsed = JSON.parse(raw) as Sede[];
    return incluirInactivas ? parsed : parsed.filter((s) => s.activo);
  } catch {
    return INITIAL_SEDES;
  }
}

/** Obtener opciones formateadas para componentes Select (solo activas) */
export function getSedesSelectOptions(): { value: string; label: string }[] {
  const sedes = getSedes(false);
  return sedes.map((s) => ({
    value: s.id,
    label: s.nombre,
  }));
}

/** Obtener sede por ID */
export function getSedeById(id: string): Sede | null {
  const sedes = getSedes(true);
  return sedes.find((s) => s.id === id || s.nombre.toLowerCase() === id.toLowerCase()) || null;
}

/** Obtener el label legible de una sede */
export function getSedeLabel(idOrValue: string): string {
  if (!idOrValue) return "—";
  const sede = getSedeById(idOrValue);
  return sede ? sede.nombre : idOrValue;
}

/** Generar código único para nueva sede */
export function generateCodigoSede(sedes: Sede[]): string {
  const prefix = "SED-";
  const existingNums = sedes
    .map((s) => s.codigo)
    .filter((c) => Boolean(c) && c.startsWith(prefix))
    .map((c) => {
      const numStr = c.replace(prefix, "");
      const n = parseInt(numStr, 10);
      return isNaN(n) ? 0 : n;
    });

  const nextNum = existingNums.length > 0 ? Math.max(...existingNums) + 1 : 1;
  return `${prefix}${String(nextNum).padStart(3, "0")}`;
}

/** Guardar una nueva sede */
export function saveSede(
  data: Omit<Sede, "id" | "fechaCreacion" | "activo"> & { codigo?: string }
): Sede {
  const sedes = getSedes(true);

  // Verificar que el nombre no esté duplicado
  const nombreExiste = sedes.find(
    (s) => s.nombre.trim().toLowerCase() === data.nombre.trim().toLowerCase()
  );
  if (nombreExiste) {
    throw new Error(`Ya existe una sede con el nombre "${data.nombre.trim()}".`);
  }

  const codigo = data.codigo?.trim() || generateCodigoSede(sedes);

  // Verificar que el código no esté duplicado
  const codigoExiste = sedes.find(
    (s) => s.codigo.trim().toLowerCase() === codigo.toLowerCase()
  );
  if (codigoExiste) {
    throw new Error(`El código "${codigo}" ya está asignado a otra sede.`);
  }

  const id = `sede-${data.nombre
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")}-${Date.now().toString(36)}`;

  const nueva: Sede = {
    id,
    codigo,
    nombre: data.nombre.trim(),
    direccion: data.direccion?.trim() || "",
    descripcion: data.descripcion?.trim() || "",
    activo: true,
    fechaCreacion: new Date().toISOString(),
  };

  sedes.push(nueva);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes));
  return nueva;
}

/** Actualizar una sede existente */
export function updateSede(
  id: string,
  updates: Partial<Omit<Sede, "id" | "fechaCreacion">>
): Sede | null {
  const sedes = getSedes(true);
  const index = sedes.findIndex((s) => s.id === id);
  if (index === -1) return null;

  if (updates.nombre && updates.nombre.trim().toLowerCase() !== sedes[index].nombre.toLowerCase()) {
    const existe = sedes.find(
      (s) => s.nombre.trim().toLowerCase() === updates.nombre!.trim().toLowerCase() && s.id !== id
    );
    if (existe) {
      throw new Error(`Ya existe otra sede con el nombre "${updates.nombre.trim()}".`);
    }
  }

  if (updates.codigo && updates.codigo.trim().toLowerCase() !== sedes[index].codigo.toLowerCase()) {
    const existe = sedes.find(
      (s) => s.codigo.trim().toLowerCase() === updates.codigo!.trim().toLowerCase() && s.id !== id
    );
    if (existe) {
      throw new Error(`El código "${updates.codigo.trim()}" ya está asignado a otra sede.`);
    }
  }

  const actualizada: Sede = {
    ...sedes[index],
    ...updates,
    nombre: updates.nombre !== undefined ? updates.nombre.trim() : sedes[index].nombre,
    codigo: updates.codigo !== undefined ? updates.codigo.trim() : sedes[index].codigo,
    direccion: updates.direccion !== undefined ? updates.direccion.trim() : sedes[index].direccion,
    descripcion: updates.descripcion !== undefined ? updates.descripcion.trim() : sedes[index].descripcion,
  };

  sedes[index] = actualizada;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes));
  return actualizada;
}

/** Alternar estado activo / inactivo de una sede */
export function toggleSedeActivo(id: string): Sede | null {
  const sedes = getSedes(true);
  const index = sedes.findIndex((s) => s.id === id);
  if (index === -1) return null;

  sedes[index].activo = !sedes[index].activo;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(sedes));
  return sedes[index];
}
