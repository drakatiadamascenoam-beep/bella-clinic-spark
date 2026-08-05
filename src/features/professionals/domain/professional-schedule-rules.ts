/**
 * Domínio puro — Regras de jornada e horários dos profissionais.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 */

export const WEEKDAYS = [
  { value: "SEGUNDA", label: "Segunda-feira", short: "Seg" },
  { value: "TERCA", label: "Terça-feira", short: "Ter" },
  { value: "QUARTA", label: "Quarta-feira", short: "Qua" },
  { value: "QUINTA", label: "Quinta-feira", short: "Qui" },
  { value: "SEXTA", label: "Sexta-feira", short: "Sex" },
  { value: "SABADO", label: "Sábado", short: "Sáb" },
  { value: "DOMINGO", label: "Domingo", short: "Dom" },
] as const;

export type Weekday = (typeof WEEKDAYS)[number]["value"];

export const WEEKDAY_VALUES = WEEKDAYS.map((day) => day.value);

export function isWeekday(value: unknown): value is Weekday {
  return typeof value === "string" && (WEEKDAY_VALUES as readonly string[]).includes(value);
}

export function weekdayLabel(value: Weekday): string {
  return WEEKDAYS.find((day) => day.value === value)?.label ?? value;
}

export function weekdayShort(value: Weekday): string {
  return WEEKDAYS.find((day) => day.value === value)?.short ?? value;
}

/** Converte "HH:mm" em minutos desde a meia-noite. null quando inválido. */
export function parseTimeToMinutes(value: string): number | null {
  const match = value.trim().match(/^(\d{2}):(\d{2})$/);
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return hours * 60 + minutes;
}

export interface WorkScheduleInput {
  diasAtendimento: string[];
  horarioInicio: string;
  horarioFim: string;
  intervaloInicio?: string | null;
  intervaloFim?: string | null;
}

export interface WorkScheduleValidation {
  valid: boolean;
  errors: string[];
}

/** Valida a jornada de trabalho: dias, horários e intervalo. */
export function validateWorkSchedule(input: WorkScheduleInput): WorkScheduleValidation {
  const errors: string[] = [];

  const validDays = input.diasAtendimento.filter(isWeekday);
  if (validDays.length === 0) {
    errors.push("Selecione ao menos um dia de atendimento.");
  }

  const inicio = parseTimeToMinutes(input.horarioInicio);
  const fim = parseTimeToMinutes(input.horarioFim);

  if (inicio === null) errors.push("Informe um horário de início válido (HH:mm).");
  if (fim === null) errors.push("Informe um horário de término válido (HH:mm).");

  if (inicio !== null && fim !== null && fim <= inicio) {
    errors.push("O horário de término deve ser posterior ao horário de início.");
  }

  const temInicioIntervalo = Boolean(input.intervaloInicio && input.intervaloInicio.length > 0);
  const temFimIntervalo = Boolean(input.intervaloFim && input.intervaloFim.length > 0);

  if (temInicioIntervalo !== temFimIntervalo) {
    errors.push("Informe início e término do intervalo, ou deixe ambos em branco.");
  } else if (temInicioIntervalo && temFimIntervalo && inicio !== null && fim !== null) {
    const intervaloInicio = parseTimeToMinutes(input.intervaloInicio as string);
    const intervaloFim = parseTimeToMinutes(input.intervaloFim as string);

    if (intervaloInicio === null || intervaloFim === null) {
      errors.push("Informe horários de intervalo válidos (HH:mm).");
    } else {
      if (intervaloFim <= intervaloInicio) {
        errors.push("O término do intervalo deve ser posterior ao início do intervalo.");
      }
      if (intervaloInicio < inicio || intervaloFim > fim) {
        errors.push("O intervalo deve estar totalmente contido na jornada de trabalho.");
      }
    }
  }

  return { valid: errors.length === 0, errors };
}

/** Formata uma faixa contínua de dias em pt-BR (ex.: "Seg–Sex"). */
function formatDayRange(days: Weekday[]): string {
  if (days.length === 0) return "Sem dias definidos";
  const ordered = WEEKDAY_VALUES.filter((day) => days.includes(day));
  const isContiguous =
    ordered.length > 1 &&
    ordered.every(
      (day, index) => index === 0 || WEEKDAY_VALUES.indexOf(day) === WEEKDAY_VALUES.indexOf(ordered[index - 1]) + 1,
    );
  if (isContiguous) {
    return `${weekdayShort(ordered[0])}–${weekdayShort(ordered[ordered.length - 1])}`;
  }
  return ordered.map(weekdayShort).join(", ");
}

/** Formatação compacta: "Seg–Sex · 09:00–18:00 (12:00–13:00)". */
export function formatWorkSchedule(input: WorkScheduleInput): string {
  const validDays = input.diasAtendimento.filter(isWeekday);
  const dayPart = formatDayRange(validDays);
  const journeyPart = `${input.horarioInicio}–${input.horarioFim}`;
  const hasBreak = Boolean(input.intervaloInicio && input.intervaloFim);
  const breakPart = hasBreak ? ` (${input.intervaloInicio}–${input.intervaloFim})` : "";
  return `${dayPart} · ${journeyPart}${breakPart}`;
}
