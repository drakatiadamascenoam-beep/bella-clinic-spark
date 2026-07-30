import {
  SCHEDULE_STATUS_LABELS,
  SCHEDULE_STATUS_TONES,
  SCHEDULE_STATUS_VALUES,
  type ScheduleStatus,
  type ScheduleStatusTone,
} from "../domain/schedule-status";
import {
  availableTransitions,
  canStartAttendance,
  isTerminal,
  type ScheduleTransition,
} from "../domain/schedule-flow";
import {
  DEFAULT_DURATION_MINUTES,
  DURATION_PRESETS,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
} from "../domain/schedule-conflict";

/**
 * Camada de apresentação do domínio da Agenda.
 *
 * Existe para que nenhum componente React precise importar diretamente
 * arquivos de `/domain`. Reexporta apenas valores e funções puras
 * necessárias à renderização.
 */

export type { ScheduleStatus, ScheduleStatusTone, ScheduleTransition };

export const scheduleStatusValues = SCHEDULE_STATUS_VALUES;
export const scheduleStatusLabels = SCHEDULE_STATUS_LABELS;
export const scheduleStatusTones = SCHEDULE_STATUS_TONES;

export const scheduleDurationPresets = DURATION_PRESETS;
export const scheduleDurationDefault = DEFAULT_DURATION_MINUTES;
export const scheduleDurationMin = MIN_DURATION_MINUTES;
export const scheduleDurationMax = MAX_DURATION_MINUTES;

export function scheduleTransitionsFor(status: ScheduleStatus): ScheduleTransition[] {
  return availableTransitions(status);
}

export function scheduleIsTerminal(status: ScheduleStatus): boolean {
  return isTerminal(status);
}

export function scheduleAllowsAttendance(status: ScheduleStatus): boolean {
  return canStartAttendance(status);
}
