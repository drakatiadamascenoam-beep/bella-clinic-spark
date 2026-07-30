/**
 * Domínio puro — Status do Agendamento (Agenda Clínica).
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 * Apenas tipos e funções determinísticas.
 */

export const SCHEDULE_STATUS = {
  AGENDADO: "AGENDADO",
  CONFIRMADO: "CONFIRMADO",
  EM_ATENDIMENTO: "EM_ATENDIMENTO",
  CONCLUIDO: "CONCLUIDO",
  CANCELADO: "CANCELADO",
  FALTA: "FALTA",
} as const;

export type ScheduleStatus = (typeof SCHEDULE_STATUS)[keyof typeof SCHEDULE_STATUS];

export const SCHEDULE_STATUS_VALUES = [
  SCHEDULE_STATUS.AGENDADO,
  SCHEDULE_STATUS.CONFIRMADO,
  SCHEDULE_STATUS.EM_ATENDIMENTO,
  SCHEDULE_STATUS.CONCLUIDO,
  SCHEDULE_STATUS.CANCELADO,
  SCHEDULE_STATUS.FALTA,
] as const;

export const SCHEDULE_STATUS_LABELS: Record<ScheduleStatus, string> = {
  AGENDADO: "Agendado",
  CONFIRMADO: "Confirmado",
  EM_ATENDIMENTO: "Em atendimento",
  CONCLUIDO: "Concluído",
  CANCELADO: "Cancelado",
  FALTA: "Falta",
};

export type ScheduleStatusTone = "planned" | "confirmed" | "active" | "done" | "void" | "alert";

/** Tom visual associado a cada status (decisão de domínio, aplicada pela UI). */
export const SCHEDULE_STATUS_TONES: Record<ScheduleStatus, ScheduleStatusTone> = {
  AGENDADO: "planned",
  CONFIRMADO: "confirmed",
  EM_ATENDIMENTO: "active",
  CONCLUIDO: "done",
  CANCELADO: "void",
  FALTA: "alert",
};

const ALIASES: Record<string, ScheduleStatus> = {
  SCHEDULED: SCHEDULE_STATUS.AGENDADO,
  MARCADO: SCHEDULE_STATUS.AGENDADO,
  CONFIRMED: SCHEDULE_STATUS.CONFIRMADO,
  IN_PROGRESS: SCHEDULE_STATUS.EM_ATENDIMENTO,
  ATENDENDO: SCHEDULE_STATUS.EM_ATENDIMENTO,
  DONE: SCHEDULE_STATUS.CONCLUIDO,
  COMPLETED: SCHEDULE_STATUS.CONCLUIDO,
  FINALIZADO: SCHEDULE_STATUS.CONCLUIDO,
  CANCELED: SCHEDULE_STATUS.CANCELADO,
  CANCELLED: SCHEDULE_STATUS.CANCELADO,
  NO_SHOW: SCHEDULE_STATUS.FALTA,
  FALTOU: SCHEDULE_STATUS.FALTA,
};

export function isScheduleStatus(value: unknown): value is ScheduleStatus {
  return (
    typeof value === "string" && (SCHEDULE_STATUS_VALUES as readonly string[]).includes(value)
  );
}

/**
 * Converte um valor bruto (banco, filtro, query string) em status de domínio.
 * Valores desconhecidos assumem AGENDADO, o único estado inicial válido.
 */
export function toScheduleStatus(value: unknown): ScheduleStatus {
  if (isScheduleStatus(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase().replace(/[\s-]/g, "_");
    if (isScheduleStatus(normalized)) return normalized;
    const alias = ALIASES[normalized];
    if (alias) return alias;
  }
  return SCHEDULE_STATUS.AGENDADO;
}

export function scheduleStatusLabel(status: ScheduleStatus): string {
  return SCHEDULE_STATUS_LABELS[status];
}

/** Status inicial obrigatório na criação de um compromisso. */
export const INITIAL_SCHEDULE_STATUS: ScheduleStatus = SCHEDULE_STATUS.AGENDADO;
