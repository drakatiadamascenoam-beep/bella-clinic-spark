import type { ConselhoProfissional, ProfessionalRole } from "../domain/professional-role";
import type { ProfessionalFormData } from "./professional-form.types";

/**
 * Contrato de domínio de Profissional exposto à UI.
 * A UI NUNCA acessa nomes físicos de colunas — apenas este modelo.
 */
export interface Professional {
  id: string;
  nome: string;
  papelClinico: ProfessionalRole;
  conselhoProfissional: ConselhoProfissional | null;
  registroProfissional: string | null;
  especialidade: string | null;
  email: string | null;
  telefone: string | null;
  diasAtendimento: string[];
  horarioInicio: string;
  horarioFim: string;
  intervaloInicio: string | null;
  intervaloFim: string | null;
  ativo: boolean;
  createdAt: string | null;
  updatedAt: string | null;
}

export interface ProfessionalSummary {
  id: string;
  nome: string;
  papelClinico: ProfessionalRole;
  especialidade: string | null;
  ativo: boolean;
}

export interface ProfessionalOption {
  id: string;
  label: string;
  papel: ProfessionalRole;
}

export type ProfessionalRoleFilter = ProfessionalRole | "all";

export interface ProfessionalFiltersInput {
  search: string;
  role: ProfessionalRoleFilter;
}

export interface ProfessionalListResult {
  items: Professional[];
  total: number;
  /** true quando a fonte de profissionais ainda não existe / não é legível. */
  sourceUnavailable: boolean;
}

export type ProfessionalUpdateInput = Partial<ProfessionalFormData> & { id: string };
