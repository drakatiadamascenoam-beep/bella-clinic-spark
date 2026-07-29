/**
 * Domínio puro — Status do Atendimento Clínico.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 * Apenas tipos e funções determinísticas.
 */

export const ATTENDANCE_STATUS = {
  EM_ANDAMENTO: "EM_ANDAMENTO",
  CONCLUIDO: "CONCLUIDO",
  CANCELADO: "CANCELADO",
} as const;

export type AttendanceStatus = (typeof ATTENDANCE_STATUS)[keyof typeof ATTENDANCE_STATUS];

export const ATTENDANCE_STATUS_VALUES = [
  ATTENDANCE_STATUS.EM_ANDAMENTO,
  ATTENDANCE_STATUS.CONCLUIDO,
  ATTENDANCE_STATUS.CANCELADO,
] as const;

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  EM_ANDAMENTO: "Em andamento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
};

/** Tom visual associado a cada status (decisão de domínio, aplicada pela UI). */
export const ATTENDANCE_STATUS_TONES: Record<AttendanceStatus, "open" | "done" | "void"> = {
  EM_ANDAMENTO: "open",
  CONCLUIDO: "done",
  CANCELADO: "void",
};

export function isAttendanceStatus(value: unknown): value is AttendanceStatus {
  return (
    typeof value === "string" &&
    (ATTENDANCE_STATUS_VALUES as readonly string[]).includes(value)
  );
}

/**
 * Converte um valor bruto (banco, filtro, query string) em status de domínio.
 * Valores desconhecidos assumem EM_ANDAMENTO, o único estado inicial válido.
 */
export function toAttendanceStatus(value: unknown): AttendanceStatus {
  if (isAttendanceStatus(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase().replace(/[\s-]/g, "_");
    if (isAttendanceStatus(normalized)) return normalized;
    if (normalized === "ABERTO" || normalized === "OPEN" || normalized === "IN_PROGRESS") {
      return ATTENDANCE_STATUS.EM_ANDAMENTO;
    }
    if (normalized === "FINALIZADO" || normalized === "DONE" || normalized === "COMPLETED") {
      return ATTENDANCE_STATUS.CONCLUIDO;
    }
    if (normalized === "CANCELED" || normalized === "CANCELLED") {
      return ATTENDANCE_STATUS.CANCELADO;
    }
  }
  return ATTENDANCE_STATUS.EM_ANDAMENTO;
}

export function attendanceStatusLabel(status: AttendanceStatus): string {
  return ATTENDANCE_STATUS_LABELS[status];
}

/** Status inicial obrigatório na abertura de uma sessão. */
export const INITIAL_ATTENDANCE_STATUS: AttendanceStatus = ATTENDANCE_STATUS.EM_ANDAMENTO;
