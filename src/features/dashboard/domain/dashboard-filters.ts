/**
 * Domínio puro — Filtros temporais do Cockpit Executivo.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 * Apenas tipos e funções determinísticas.
 */

export const DASHBOARD_PERIODS = [
  "today",
  "week",
  "month",
  "last30",
  "last90",
  "year",
  "custom",
] as const;

export type DashboardPeriod = (typeof DASHBOARD_PERIODS)[number];

export const DASHBOARD_PERIOD_LABELS: Record<DashboardPeriod, string> = {
  today: "Hoje",
  week: "Esta semana",
  month: "Este mês",
  last30: "Últimos 30 dias",
  last90: "Últimos 90 dias",
  year: "Este ano",
  custom: "Personalizado",
};

/** Intervalo fechado, em chaves de data (YYYY-MM-DD), no fuso local do cliente. */
export interface DateRange {
  start: string;
  end: string;
}

export function isDashboardPeriod(value: unknown): value is DashboardPeriod {
  return typeof value === "string" && (DASHBOARD_PERIODS as readonly string[]).includes(value);
}

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, "0");
  const day = `${date.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(key);
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return Number.isNaN(date.getTime()) ? null : date;
}

/** Converte um timestamp ISO (ou data solta) em chave de data local. */
export function isoToDateKey(value: string | null): string | null {
  if (!value) return null;
  const direct = /^(\d{4}-\d{2}-\d{2})/.exec(value);
  if (direct && !value.includes("T")) return direct[1];
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return direct ? direct[1] : null;
  return toDateKey(parsed);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Resolve o intervalo de um período em relação a uma data de referência.
 * A semana começa na segunda-feira (padrão clínico brasileiro).
 */
export function resolvePeriodRange(
  period: DashboardPeriod,
  reference: Date,
  custom?: DateRange | null,
): DateRange {
  const today = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());

  switch (period) {
    case "today":
      return { start: toDateKey(today), end: toDateKey(today) };
    case "week": {
      const weekday = (today.getDay() + 6) % 7;
      return { start: toDateKey(addDays(today, -weekday)), end: toDateKey(today) };
    }
    case "month":
      return {
        start: toDateKey(new Date(today.getFullYear(), today.getMonth(), 1)),
        end: toDateKey(today),
      };
    case "last30":
      return { start: toDateKey(addDays(today, -29)), end: toDateKey(today) };
    case "last90":
      return { start: toDateKey(addDays(today, -89)), end: toDateKey(today) };
    case "year":
      return { start: toDateKey(new Date(today.getFullYear(), 0, 1)), end: toDateKey(today) };
    case "custom": {
      if (custom && parseDateKey(custom.start) && parseDateKey(custom.end)) {
        return custom.start <= custom.end
          ? custom
          : { start: custom.end, end: custom.start };
      }
      return { start: toDateKey(addDays(today, -29)), end: toDateKey(today) };
    }
  }
}

/** Enumera as chaves de data do intervalo, com teto de segurança. */
export function enumerateDays(range: DateRange, maxDays = 92): string[] {
  const start = parseDateKey(range.start);
  const end = parseDateKey(range.end);
  if (!start || !end || start > end) return [];

  const days: string[] = [];
  let cursor = start;
  while (cursor <= end && days.length < maxDays) {
    days.push(toDateKey(cursor));
    cursor = addDays(cursor, 1);
  }

  // Intervalos maiores que o teto priorizam o recorte mais recente.
  if (cursor <= end) {
    const tail: string[] = [];
    let back = end;
    while (tail.length < maxDays) {
      tail.unshift(toDateKey(back));
      back = addDays(back, -1);
    }
    return tail;
  }

  return days;
}

export function isWithinRange(value: string | null, range: DateRange): boolean {
  const key = isoToDateKey(value);
  if (!key) return false;
  return key >= range.start && key <= range.end;
}

export function countDays(range: DateRange): number {
  const start = parseDateKey(range.start);
  const end = parseDateKey(range.end);
  if (!start || !end || start > end) return 0;
  return Math.round((end.getTime() - start.getTime()) / 86_400_000) + 1;
}

/** Intervalo imediatamente anterior, de mesma duração — base dos comparativos. */
export function previousRange(range: DateRange): DateRange {
  const start = parseDateKey(range.start);
  const end = parseDateKey(range.end);
  const size = countDays(range);
  if (!start || !end || size === 0) return range;
  return { start: toDateKey(addDays(start, -size)), end: toDateKey(addDays(end, -size)) };
}

export function formatRangeLabel(range: DateRange): string {
  const start = parseDateKey(range.start);
  const end = parseDateKey(range.end);
  if (!start || !end) return "";
  const fmt = (date: Date) =>
    `${`${date.getDate()}`.padStart(2, "0")}/${`${date.getMonth() + 1}`.padStart(2, "0")}`;
  return range.start === range.end ? fmt(start) : `${fmt(start)} — ${fmt(end)}`;
}
