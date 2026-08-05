/**
 * Contrato público do módulo de Profissionais.
 * Demais domínios (Agenda, Dashboard) consomem EXCLUSIVAMENTE este barrel.
 */
export { useProfissionais, useProfissional, useCreateProfissional, useUpdateProfissional, professionalKeys } from "./hooks/useProfessional";
export type {
  Professional,
  ProfessionalSummary,
  ProfessionalOption,
  ProfessionalFiltersInput,
  ProfessionalListResult,
} from "./types/professional.types";
export type { ProfessionalRole, ConselhoProfissional } from "./types/professional-view";
export {
  professionalRoleLabels,
  professionalRoleValues,
  conselhoLabels,
  conselhoValues,
} from "./types/professional-view";
