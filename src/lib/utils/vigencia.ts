/**
 * Mapa de vigencias máximas por documento (en meses).
 * null  = Sin vigencia (no vence)
 * "poliza" = Según póliza (el contrato define el plazo)
 * undefined = Pendiente de confirmar con el cliente
 */
export type Vigencia = number | null | "poliza";

export const VIGENCIA_DOCS: Record<string, Vigencia> = {
  // ── Requisitos Generales — No TAR ──────────────────────────────
  iperc:           12,  // Matriz IPERC — 1 año
  difusion_iperc:  12,  // Registro de difusión Matriz IPERC — 1 año
  directorio:      12,  // Directorio telefónico — 1 año
  matriz_aspectos: 12,  // Matriz de aspectos e impactos — 1 año

  // ── Requisitos Generales — TAR extras ─────────────────────────
  pets:            12,  // PETS — 1 año
  difusion_pets:   12,  // Registro de difusión de PETS — 1 año
  plan_emergencia: 12,  // Plan de Emergencia — 1 año
  lista_epp:       null, // Lista de EPP — Sin vigencia

  // ── Casos especiales Altura (pendiente confirmar con cliente) ──
  ensayo_andamio:               undefined,
  cert_operatividad_plataforma: undefined,
  seguro_resp_civil:            undefined,

  // ── Carga Masiva ───────────────────────────────────────────────
  sctr:  "poliza", // SCTR — Según póliza
  samo:  12,       // SAMO — 1 año (pendiente confirmar)

  // ── Personal — Base (todos los trabajadores) ──────────────────
  induccion_sig: 12,  // Inducción SIG — 1 año
  camo:          24,  // CAMO — 2 años (No TAR) / ver nota para TAR
  risst:         12,  // Cargo de entrega de RISST — 1 año

  // ── Personal — TAR extras ──────────────────────────────────────
  prevencionista: undefined, // Prevencionista / SSOMA — pendiente
  registro_epp:   null,      // Registro de entrega de EPP — Sin vigencia

  // ── Personal — Trabajos en Altura ─────────────────────────────
  test_medico_altura:        12, // CAMO TEST DE ALTURA / CONFINADO — 1 año
  cert_capacitacion_altura:  12, // Certificado de capacitación en TAR — 1 año

  // ── Personal — Plataforma elevadora ───────────────────────────
  cert_operador_plataforma: 12, // Pendiente confirmar — usando 1 año por defecto
};

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Calcula la fecha de vencimiento sumando N meses a la fecha de emisión.
 * Retorna YYYY-MM-DD o "" si la fecha es vacía.
 */
export function calcularFechaVencimiento(
  fechaEmision: string,
  meses: number
): string {
  if (!fechaEmision) return "";
  const date = new Date(fechaEmision + "T12:00:00");
  date.setMonth(date.getMonth() + meses);
  return date.toISOString().split("T")[0];
}

/**
 * Formatea YYYY-MM-DD a DD/MM/YYYY para mostrar al usuario.
 */
export function formatearFecha(fecha: string): string {
  if (!fecha) return "";
  const [year, month, day] = fecha.split("-");
  return `${day}/${month}/${year}`;
}

/**
 * Texto legible de la vigencia para mostrar en la UI.
 */
export function vigenciaLabel(vigencia: Vigencia): string {
  if (vigencia === "poliza") return "Según póliza";
  if (vigencia === null) return "Sin vigencia";
  if (vigencia === undefined) return "";
  if (vigencia % 12 === 0) {
    const años = vigencia / 12;
    return `${años} año${años > 1 ? "s" : ""}`;
  }
  return `${vigencia} mes${vigencia > 1 ? "es" : ""}`;
}
