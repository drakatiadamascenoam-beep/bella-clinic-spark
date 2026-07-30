import { occupiesSlot } from "./schedule-flow";
import type { ScheduleStatus } from "./schedule-status";

/**
 * Domínio puro — Regras de sobreposição e limites de duração da Agenda.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 */

export const MIN_DURATION_MINUTES = 15;
export const MAX_DURATION_MINUTES = 240;
export const DEFAULT_DURATION_MINUTES = 60;
export const DURATION_PRESETS = [30, 45, 60, 90, 120] as const;

/** Compromisso reduzido ao mínimo necessário para o cálculo de conflito. */
export interface ScheduleSlot {
  id: string;
  startsAt: string;
  durationMinutes: number;
  status: ScheduleStatus;
  label: string | null;
}

export interface ScheduleInterval {
  start: number;
  end: number;
}

export interface ScheduleConflict {
  id: string;
  label: string | null;
  startsAt: string;
  durationMinutes: number;
}

export interface ScheduleConflictCheck {
  hasConflict: boolean;
  conflicts: ScheduleConflict[];
  message: string | null;
}

export function isValidDuration(minutes: number): boolean {
  return (
    Number.isFinite(minutes) &&
    Number.isInteger(minutes) &&
    minutes >= MIN_DURATION_MINUTES &&
    minutes <= MAX_DURATION_MINUTES
  );
}

export function durationErrorMessage(): string {
  return `A duração deve estar entre ${MIN_DURATION_MINUTES} e ${MAX_DURATION_MINUTES} minutos.`;
}

/** Converte início + duração em intervalo absoluto (epoch ms). */
export function toInterval(startsAt: string, durationMinutes: number): ScheduleInterval | null {
  const start = new Date(startsAt).getTime();
  if (Number.isNaN(start) || !isValidDuration(durationMinutes)) return null;
  return { start, end: start + durationMinutes * 60_000 };
}

export function overlaps(a: ScheduleInterval, b: ScheduleInterval): boolean {
  return a.start < b.end && b.start < a.end;
}

function formatClock(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

function buildMessage(conflicts: ScheduleConflict[]): string {
  const first = conflicts[0];
  const who = first.label ?? "outro compromisso";
  const base = `Este horário conflita com ${who} às ${formatClock(first.startsAt)}.`;
  if (conflicts.length === 1) {
    return `${base} Ajuste o horário ou a duração para continuar.`;
  }
  return `${base} Há ${conflicts.length} compromissos sobrepostos nesta faixa. Ajuste o horário ou a duração para continuar.`;
}

/**
 * Verifica choque de agenda contra os compromissos já existentes.
 * Cancelados e faltas liberam o espaço e são ignorados.
 */
export function checkScheduleConflict(
  candidate: { startsAt: string; durationMinutes: number; ignoreId?: string | null },
  existing: readonly ScheduleSlot[],
): ScheduleConflictCheck {
  const interval = toInterval(candidate.startsAt, candidate.durationMinutes);
  if (!interval) {
    return { hasConflict: false, conflicts: [], message: null };
  }

  const conflicts: ScheduleConflict[] = [];
  for (const slot of existing) {
    if (candidate.ignoreId && slot.id === candidate.ignoreId) continue;
    if (!occupiesSlot(slot.status)) continue;
    const other = toInterval(slot.startsAt, slot.durationMinutes);
    if (!other) continue;
    if (overlaps(interval, other)) {
      conflicts.push({
        id: slot.id,
        label: slot.label,
        startsAt: slot.startsAt,
        durationMinutes: slot.durationMinutes,
      });
    }
  }

  return {
    hasConflict: conflicts.length > 0,
    conflicts,
    message: conflicts.length > 0 ? buildMessage(conflicts) : null,
  };
}

/** Lança erro determinístico quando o compromisso não pode ser agendado. */
export function assertSchedulable(
  candidate: { startsAt: string; durationMinutes: number; ignoreId?: string | null },
  existing: readonly ScheduleSlot[],
): void {
  if (!isValidDuration(candidate.durationMinutes)) {
    throw new Error(durationErrorMessage());
  }
  if (Number.isNaN(new Date(candidate.startsAt).getTime())) {
    throw new Error("Informe uma data e hora válidas para o compromisso.");
  }
  const result = checkScheduleConflict(candidate, existing);
  if (result.hasConflict && result.message) {
    throw new Error(result.message);
  }
}
