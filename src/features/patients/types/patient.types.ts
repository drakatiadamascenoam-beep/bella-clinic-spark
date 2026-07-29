import type { PatientFormData } from "./patient-form.types";

/**
 * Modelo de domínio de Paciente exposto à UI.
 * A UI NUNCA acessa nomes físicos de colunas — apenas este contrato.
 */
export interface Patient {
  id: string;
  nome: string;
  nomeSocial: string | null;
  cpf: string | null;
  dataNascimento: string | null;
  telefone: string | null;
  email: string | null;
  sexo: string | null;
  observacoesAlergias: string | null;
  createdAt: string | null;
  updatedAt: string | null;
}

export const PATIENT_SORT_FIELDS = ["nome", "created_at"] as const;
export type PatientSortField = (typeof PATIENT_SORT_FIELDS)[number];
export type PatientSortDirection = "asc" | "desc";

export interface PatientFiltersInput {
  search: string;
  sortBy: PatientSortField;
  sortDir: PatientSortDirection;
  page: number;
}

export interface PatientListResult {
  items: Patient[];
  total: number;
  page: number;
  pageSize: number;
  /** true quando a fonte de pacientes ainda não existe / não é legível. */
  sourceUnavailable: boolean;
}

export type PatientUpdateInput = Partial<PatientFormData> & { id: string };
