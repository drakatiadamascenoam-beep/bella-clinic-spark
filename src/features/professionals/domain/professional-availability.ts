/**
 * Domínio puro — Disponibilidade clínica de um profissional em um instante.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 */
import {
  isWeekday,
  parseTimeToMinutes,
  WEEKDAY_VALUES,
  weekdayLabel,
  type Weekday,
} from "./professional-schedule-rules";

export interface AvailabilitySchedule {
  ativo: boolean;
  diasAtendimento: string[];
  horarioInicio: string;
  horarioFim: string;
  intervaloInicio?: string | null;
  intervaloFim?: string | null;
}

function weekdayFromIso(isoDateTime: string): Weekday | null {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return null;
  // getDay(): 0=Domingo..6=Sábado. WEEKDAY_VALUES começa em SEGUNDA.
  const jsDay = date.getDay();
  const index = jsDay === 0 ? 6 : jsDay - 1;
  return WEEKDAY_VALUES[index] ?? null;
}

function minutesFromIso(isoDateTime: string): number | null {
  const date = new Date(isoDateTime);
  if (Number.isNaN(date.getTime())) return null;
  return date.getHours() * 60 + date.getMinutes();
}

/** true quando o instante cai dentro da jornada declarada (sem considerar intervalo). */
export function isWithinJourney(schedule: AvailabilitySchedule, isoDateTime: string): boolean {
  const minutes = minutesFromIso(isoDateTime);
  const inicio = parseTimeToMinutes(schedule.horarioInicio);
  const fim = parseTimeToMinutes(schedule.horarioFim);
  if (minutes === null || inicio === null || fim === null) return false;
  return minutes >= inicio && minutes < fim;
}

/** true quando o instante cai dentro do intervalo/pausa declarado. */
export function isOnBreak(schedule: AvailabilitySchedule, isoDateTime: string): boolean {
  if (!schedule.intervaloInicio || !schedule.intervaloFim) return false;
  const minutes = minutesFromIso(isoDateTime);
  const inicio = parseTimeToMinutes(schedule.intervaloInicio);
  const fim = parseTimeToMinutes(schedule.intervaloFim);
  if (minutes === null || inicio === null || fim === null) return false;
  return minutes >= inicio && minutes < fim;
}

/** true quando o profissional está apto a receber um agendamento no instante informado. */
export function isAvailableAt(schedule: AvailabilitySchedule, isoDateTime: string): boolean {
  if (!schedule.ativo) return false;
  const weekday = weekdayFromIso(isoDateTime);
  if (weekday === null || !schedule.diasAtendimento.filter(isWeekday).includes(weekday)) {
    return false;
  }
  return isWithinJourney(schedule, isoDateTime) && !isOnBreak(schedule, isoDateTime);
}

export interface AvailabilityCoverage {
  ativo: boolean;
  diasAtendimento: string[];
}

/** true quando o profissional está ativo e possui ao menos um dia de cobertura. */
export function canReceiveAppointments(professional: AvailabilityCoverage): boolean {
  return professional.ativo && professional.diasAtendimento.filter(isWeekday).length > 0;
}

/** Explicação determinística pt-BR sobre a disponibilidade em um instante. */
export function availabilityReason(schedule: AvailabilitySchedule, isoDateTime: string): string {
  if (!schedule.ativo) return "Profissional inativo — não recebe agendamentos.";

  const weekday = weekdayFromIso(isoDateTime);
  if (weekday === null) return "Data e hora informadas são inválidas.";

  if (!schedule.diasAtendimento.filter(isWeekday).includes(weekday)) {
    return `Profissional não atende às ${weekdayLabel(weekday).toLowerCase()}s.`;
  }

  if (!isWithinJourney(schedule, isoDateTime)) {
    return `Fora da jornada de trabalho (${schedule.horarioInicio}–${schedule.horarioFim}).`;
  }

  if (isOnBreak(schedule, isoDateTime)) {
    return `Profissional em intervalo (${schedule.intervaloInicio}–${schedule.intervaloFim}).`;
  }

  return "Profissional disponível para atendimento.";
}
