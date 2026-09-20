/**
 * Servicio de persistencia de vehículos en localStorage.
 * MOCK — pendiente de integración real con API/backend.
 */

export interface Vehiculo {
  id: string;
  marca: string;
  color: string;
  placa: string;
  creadoPor: string;
}

const STORAGE_KEY = "imc_vehiculos";

/** Obtener todos los vehículos guardados */
export function getVehiculos(): Vehiculo[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Vehiculo[];
  } catch {
    return [];
  }
}

/** Obtener vehículos de un usuario específico */
export function getVehiculosByUser(username: string): Vehiculo[] {
  const todos = getVehiculos();
  return todos.filter((v) => v.creadoPor === username);
}

/** Guardar un nuevo vehículo */
export function saveVehiculo(vehiculo: Omit<Vehiculo, "id">): Vehiculo {
  const vehiculos = getVehiculos();
  const nuevo: Vehiculo = {
    ...vehiculo,
    id: crypto.randomUUID(),
  };
  vehiculos.push(nuevo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehiculos));
  return nuevo;
}

/** Guardar vehículos de forma masiva (import) */
export function saveVehiculosMasivo(nuevos: Omit<Vehiculo, "id">[]): Vehiculo[] {
  const vehiculos = getVehiculos();
  const agregados = nuevos.map((v) => ({ ...v, id: crypto.randomUUID() }));
  const total = [...vehiculos, ...agregados];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(total));
  return agregados;
}

/** Actualizar un vehículo existente */
export function updateVehiculo(id: string, updates: Partial<Vehiculo>): Vehiculo | null {
  const vehiculos = getVehiculos();
  const index = vehiculos.findIndex((v) => v.id === id);
  if (index === -1) return null;

  const actualizado = { ...vehiculos[index], ...updates };
  vehiculos[index] = actualizado;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(vehiculos));
  return actualizado;
}

/** Eliminar un vehículo */
export function deleteVehiculo(id: string): void {
  const vehiculos = getVehiculos();
  const filtrados = vehiculos.filter((v) => v.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrados));
}
