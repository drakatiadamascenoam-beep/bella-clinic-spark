/** Formatadores de apresentação do módulo de Profissionais. */
import { professionalFormatRegistration, type ConselhoProfissional } from "../types/professional-view";

export function formatRegistrationDisplay(
  conselho: ConselhoProfissional | null,
  registro: string | null,
): string {
  if (!registro) return "—";
  const formatted = professionalFormatRegistration(conselho, registro);
  return formatted.length > 0 ? formatted : registro;
}

export function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export function formatContact(email: string | null, telefone: string | null): string {
  if (email && telefone) return `${telefone} · ${email}`;
  return email ?? telefone ?? "—";
}
