/** Formatadores puros de apresentação do módulo de Agenda. */

export function formatTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatDateTime(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatLongDate(dateKey: string): string {
  const date = new Date(`${dateKey}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateKey;
  return date.toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

/** Faixa de horário "09:00 – 10:00" a partir do início e da duração. */
export function formatSlotRange(startsAt: string | null, minutes: number): string {
  if (!startsAt) return "—";
  const start = new Date(startsAt);
  if (Number.isNaN(start.getTime())) return startsAt;
  const end = new Date(start.getTime() + minutes * 60_000);
  return `${formatTime(start.toISOString())} – ${formatTime(end.toISOString())}`;
}

export function truncate(value: string | null, max = 120): string {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
}
