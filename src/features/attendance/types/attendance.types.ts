import type { AttendanceStatus } from "../domain/attendance-status";
import type { AttendanceFormData } from "./attendance-form.types";

/**
 * Contrato de domínio de Atendimento exposto à UI.
 * A UI NUNCA acessa nomes físicos de colunas — apenas este modelo.
 */
export interface Attendance {
  id: string;
  pacienteId: string | null;
  pacienteNome: string | null;
  protocoloId: string | null;
  protocoloNome: string | null;
  dataAtendimento: string | null;
  status: AttendanceStatus;
  queixaPrincipal: string | null;
  evolucaoClinica: string | null;
  observacoesPrescricoes: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export type AttendanceStatusFilter = AttendanceStatus | "all";

export interface AttendanceFiltersInput {
  search: string;
  status: AttendanceStatusFilter;
  page: number;
}

export interface AttendanceListResult {
  items: Attendance[];
  total: number;
  page: number;
  pageSize: number;
  /** true quando a fonte de atendimentos ainda não existe / não é legível. */
  sourceUnavailable: boolean;
}

export type AttendanceUpdateInput = AttendanceFormData & { id: string };

export interface AttendanceStatusChangeInput {
  id: string;
  status: AttendanceStatus;
}
