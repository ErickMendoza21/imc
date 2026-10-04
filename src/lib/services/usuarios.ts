/**
 * Servicio de persistencia de usuarios en localStorage.
 * MOCK — pendiente de integración real con API/backend.
 */

export type RolUsuario = "solicitante" | "revisor" | "sapo" | "inspector";

export interface Usuario {
  id: string;
  username: string;
  password: string;
  rol: RolUsuario;
  empresa: string;
  descripcion: string;
  sede?: string;
  nombreCompleto: string;
  celular: string;
  correo: string;
  activo: boolean;
  fechaCreacion: string;
}

const STORAGE_KEY = "imc_usuarios";

/** Obtener todos los usuarios guardados */
export function getUsuarios(): Usuario[] {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as Usuario[];
    // Migración: sanear campos y agregar 'activo' si no existe (compatibilidad)
    return parsed.map((u) => ({
      ...u,
      username: (u.username || "").trim(),
      password: (u.password || "").trim(),
      activo: u.activo ?? true,
    }));
  } catch {
    return [];
  }
}

/** Guardar un nuevo usuario */
export function saveUsuario(
  usuario: Omit<Usuario, "id" | "fechaCreacion" | "activo">
): Usuario {
  const usuarios = getUsuarios();

  // Verificar que el username no exista
  const existe = usuarios.find((u) => u.username === usuario.username);
  if (existe) {
    throw new Error("El nombre de usuario ya existe.");
  }

  const nuevo: Usuario = {
    ...usuario,
    id: crypto.randomUUID(),
    activo: true,
    fechaCreacion: new Date().toISOString(),
  };
  usuarios.push(nuevo);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  // Debug: verificar que se guardó correctamente
  console.log("=== DEBUG SAVE USUARIO ===");
  console.log("Guardado:", nuevo.username, nuevo.password);
  console.log("Total usuarios:", usuarios.length);
  console.log("Verificación re-lectura:", localStorage.getItem(STORAGE_KEY));
  return nuevo;
}

/** Actualizar un usuario existente */
export function updateUsuario(
  id: string,
  updates: Partial<Omit<Usuario, "id" | "fechaCreacion">>
): Usuario | null {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) return null;

  // Si se cambia el username, verificar que no exista otro usuario con ese username
  if (updates.username && updates.username !== usuarios[index].username) {
    const existe = usuarios.find((u) => u.username === updates.username && u.id !== id);
    if (existe) {
      throw new Error("El nombre de usuario ya existe.");
    }
  }

  const actualizado = { ...usuarios[index], ...updates };
  usuarios[index] = actualizado;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  return actualizado;
}

/** Alternar el estado activo/inactivo de un usuario */
export function toggleUsuarioActivo(id: string): Usuario | null {
  const usuarios = getUsuarios();
  const index = usuarios.findIndex((u) => u.id === id);
  if (index === -1) return null;

  usuarios[index].activo = !usuarios[index].activo;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(usuarios));
  return usuarios[index];
}

/** Obtener un usuario por su username */
export function getUsuarioByUsername(username: string): Usuario | null {
  const usuarios = getUsuarios();
  return usuarios.find((u) => u.username === username) || null;
}

/** Eliminar un usuario por ID */
export function deleteUsuario(id: string): boolean {
  const usuarios = getUsuarios();
  const filtered = usuarios.filter((u) => u.id !== id);
  if (filtered.length === usuarios.length) return false;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  return true;
}
