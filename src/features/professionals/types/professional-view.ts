import {
  CONSELHO_PROFISSIONAL_LABELS,
  CONSELHO_PROFISSIONAL_VALUES,
  isClinicalRole,
  PROFESSIONAL_ROLE_LABELS,
  PROFESSIONAL_ROLE_VALUES,
  requiresRegistration,
  type ConselhoProfissional,
  type ProfessionalRole,
} from "../domain/professional-role";
import { formatRegistration, registrationErrorMessage } from "../domain/professional-registration";
import {
  formatWorkSchedule,
  WEEKDAYS,
  type WorkScheduleInput,
} from "../domain/professional-schedule-rules";

/**
 * Camada de apresentação do domínio de Profissionais.
 *
 * Existe para que nenhum componente React precise importar diretamente
 * arquivos de `/domain`. Reexporta apenas valores e funções puras
 * necessárias à renderização.
 */

export type { ConselhoProfissional, ProfessionalRole, WorkScheduleInput };

export const conselhoValues = CONSELHO_PROFISSIONAL_VALUES;
export const conselhoLabels = CONSELHO_PROFISSIONAL_LABELS;

export const professionalRoleValues = PROFESSIONAL_ROLE_VALUES;
export const professionalRoleLabels = PROFESSIONAL_ROLE_LABELS;

export const professionalWeekdays = WEEKDAYS;

export function professionalRequiresRegistration(role: ProfessionalRole): boolean {
  return requiresRegistration(role);
}

export function professionalIsClinical(role: ProfessionalRole): boolean {
  return isClinicalRole(role);
}

export function professionalFormatRegistration(
  conselho: ConselhoProfissional | null,
  registration: string,
): string {
  return formatRegistration(conselho, registration);
}

export function professionalRegistrationError(value: string): string | null {
  return registrationErrorMessage(value);
}

export function professionalFormatSchedule(input: WorkScheduleInput): string {
  return formatWorkSchedule(input);
}
