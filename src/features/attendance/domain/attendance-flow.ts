import {
  ATTENDANCE_STATUS,
  attendanceStatusLabel,
  type AttendanceStatus,
} from "./attendance-status";

/**
 * Domínio puro — Máquina de estados do Atendimento Clínico.
 *
 * Regras:
 * - EM_ANDAMENTO → CONCLUIDO
 * - EM_ANDAMENTO → CANCELADO
 * - CONCLUIDO e CANCELADO são terminais: reabertura arbitrária é proibida.
 */

const TRANSITIONS: Record<AttendanceStatus, readonly AttendanceStatus[]> = {
  EM_ANDAMENTO: [ATTENDANCE_STATUS.CONCLUIDO, ATTENDANCE_STATUS.CANCELADO],
  CONCLUIDO: [],
  CANCELADO: [],
};

export interface AttendanceTransition {
  target: AttendanceStatus;
  label: string;
  /** Exige confirmação explícita do operador antes de aplicar. */
  sensitive: boolean;
}

const TRANSITION_LABELS: Record<AttendanceStatus, string> = {
  EM_ANDAMENTO: "Reabrir atendimento",
  CONCLUIDO: "Concluir atendimento",
  CANCELADO: "Cancelar atendimento",
};

export function canTransition(from: AttendanceStatus, to: AttendanceStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function isTerminal(status: AttendanceStatus): boolean {
  return TRANSITIONS[status].length === 0;
}

/** Indica se a sessão ainda aceita edição de conteúdo clínico. */
export function isEditable(status: AttendanceStatus): boolean {
  return status === ATTENDANCE_STATUS.EM_ANDAMENTO;
}

export function availableTransitions(from: AttendanceStatus): AttendanceTransition[] {
  return TRANSITIONS[from].map((target) => ({
    target,
    label: TRANSITION_LABELS[target],
    sensitive: target === ATTENDANCE_STATUS.CANCELADO,
  }));
}

export function transitionErrorMessage(from: AttendanceStatus, to: AttendanceStatus): string {
  if (isTerminal(from)) {
    return `Atendimento ${attendanceStatusLabel(from).toLowerCase()} é um estado final e não pode ser reaberto.`;
  }
  return `Transição de "${attendanceStatusLabel(from)}" para "${attendanceStatusLabel(to)}" não é permitida.`;
}

/**
 * Aplica a transição respeitando a máquina de estados.
 * Lança erro determinístico quando a transição é inválida.
 */
export function applyTransition(from: AttendanceStatus, to: AttendanceStatus): AttendanceStatus {
  if (!canTransition(from, to)) {
    throw new Error(transitionErrorMessage(from, to));
  }
  return to;
}
