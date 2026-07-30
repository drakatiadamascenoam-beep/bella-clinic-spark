import type { ScheduleStatus } from "../domain/schedule-status";
import type { ScheduleFormData } from "./schedule-form.types";

/**
 * Contrato de domínio da Agenda Clínica exposto à UI.
 * A UI NUNCA acessa nomes físicos de colunas — apenas este modelo.
 */
export interface Appointment {
  id: string;
  pacienteId: string | null;
  pacienteNome: string | null;
  protocoloId: string | null;
  protocoloNome: string | null;
  profissionalId: string | null;
  profissionalNome: string | null;
  dataHoraInicio: string | null;
  duracaoMinutos: number;
  status: ScheduleStatus;
  observacoes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type ScheduleStatusFilter = ScheduleStatus | "all";

export interface ScheduleFiltersInput {
  /** Data no formato YYYY-MM-DD. */
  date: string;
  status: ScheduleStatusFilter;
}

export interface ScheduleListResult {
  items: Appointment[];
  total: number;
  date: string;
  /** true quando a fonte de agendamentos ainda não existe / não é legível. */
  sourceUnavailable: boolean;
}

export interface ScheduleStatusChangeInput {
  id: string;
  status: ScheduleStatus;
}

export type ScheduleCreateInput = ScheduleFormData;

/** Contexto encaminhado ao Atendimento Clínico (sem criar registros). */
export interface ScheduleAttendanceContext {
  pacienteId: string | null;
  protocoloId: string | null;
  dataAtendimento: string | null;
}
