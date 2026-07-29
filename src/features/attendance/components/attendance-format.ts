/** Formatadores puros de apresentação do módulo de Atendimento. */

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

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("pt-BR");
}

export function truncate(value: string | null, max = 120): string {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max).trimEnd()}…` : value;
}
