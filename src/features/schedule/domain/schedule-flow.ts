import {
  SCHEDULE_STATUS,
  scheduleStatusLabel,
  type ScheduleStatus,
} from "./schedule-status";

/**
 * Domínio puro — Máquina de estados do Agendamento.
 *
 * AGENDADO       → CONFIRMADO | CANCELADO
 * CONFIRMADO     → EM_ATENDIMENTO | FALTA | CANCELADO
 * EM_ATENDIMENTO → CONCLUIDO
 * CONCLUIDO / CANCELADO / FALTA são terminais.
 */

const TRANSITIONS: Record<ScheduleStatus, readonly ScheduleStatus[]> = {
  AGENDADO: [SCHEDULE_STATUS.CONFIRMADO, SCHEDULE_STATUS.CANCELADO],
  CONFIRMADO: [
    SCHEDULE_STATUS.EM_ATENDIMENTO,
    SCHEDULE_STATUS.FALTA,
    SCHEDULE_STATUS.CANCELADO,
  ],
  EM_ATENDIMENTO: [SCHEDULE_STATUS.CONCLUIDO],
  CONCLUIDO: [],
  CANCELADO: [],
  FALTA: [],
};

const TRANSITION_LABELS: Record<ScheduleStatus, string> = {
  AGENDADO: "Reagendar",
  CONFIRMADO: "Confirmar presença",
  EM_ATENDIMENTO: "Iniciar atendimento",
  CONCLUIDO: "Concluir compromisso",
  CANCELADO: "Cancelar compromisso",
  FALTA: "Registrar falta",
};

export interface ScheduleTransition {
  target: ScheduleStatus;
  label: string;
  /** Exige confirmação explícita do operador antes de aplicar. */
  sensitive: boolean;
}

export function canTransition(from: ScheduleStatus, to: ScheduleStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(status: ScheduleStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** Indica se o compromisso ainda ocupa espaço útil na agenda. */
export function occupiesSlot(status: ScheduleStatus): boolean {
  return status !== SCHEDULE_STATUS.CANCELADO && status !== SCHEDULE_STATUS.FALTA;
}

/** Indica se a sessão clínica pode ser iniciada a partir do compromisso. */
export function canStartAttendance(status: ScheduleStatus): boolean {
  return (
    status === SCHEDULE_STATUS.CONFIRMADO || status === SCHEDULE_STATUS.EM_ATENDIMENTO
  );
}

export function availableTransitions(from: ScheduleStatus): ScheduleTransition[] {
  return TRANSITIONS[from].map((target) => ({
    target,
    label: TRANSITION_LABELS[target],
    sensitive:
      target === SCHEDULE_STATUS.CANCELADO || target === SCHEDULE_STATUS.FALTA,
  }));
}

export function transitionErrorMessage(from: ScheduleStatus, to: ScheduleStatus): string {
  if (isTerminal(from)) {
    return `Compromisso ${scheduleStatusLabel(from).toLowerCase()} é um estado final e não pode ser alterado.`;
  }
  return `Transição de "${scheduleStatusLabel(from)}" para "${scheduleStatusLabel(to)}" não é permitida.`;
}

/**
 * Aplica a transição respeitando a máquina de estados.
 * Lança erro determinístico quando a transição é inválida.
 */
export function applyTransition(from: ScheduleStatus, to: ScheduleStatus): ScheduleStatus {
  if (!canTransition(from, to)) {
    throw new Error(transitionErrorMessage(from, to));
  }
  return to;
}
