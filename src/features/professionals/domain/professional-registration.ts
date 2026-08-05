/**
 * Domínio puro — Validação e formatação de registro profissional (número + UF).
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 */
import { CONSELHO_PROFISSIONAL, type ConselhoProfissional } from "./professional-role";

export const BRAZILIAN_STATES = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO",
  "MA", "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI",
  "RJ", "RN", "RS", "RO", "RR", "SC", "SP", "SE", "TO",
] as const;

export type BrazilianState = (typeof BRAZILIAN_STATES)[number];

export function isBrazilianState(value: unknown): value is BrazilianState {
  return typeof value === "string" && (BRAZILIAN_STATES as readonly string[]).includes(value);
}

export interface ParsedRegistration {
  numero: string;
  uf: BrazilianState;
}

/** Interpreta "123456/MT", "123456-MT" ou "123456 MT" em número + UF. */
export function parseRegistration(value: string): ParsedRegistration | null {
  const trimmed = value.trim().toUpperCase();
  if (trimmed.length === 0) return null;
  const match = trimmed.match(/^(\d{1,10})[\s/-]+([A-Z]{2})$/);
  if (!match) return null;
  const [, numero, uf] = match;
  if (!isBrazilianState(uf)) return null;
  return { numero, uf };
}

export function isValidRegistration(value: string): boolean {
  return parseRegistration(value) !== null;
}

/** Formata como "CRM 123456/MT". Retorna string vazia quando dados insuficientes. */
export function formatRegistration(
  conselho: ConselhoProfissional | null,
  registration: string,
): string {
  const parsed = parseRegistration(registration);
  if (!parsed) return "";
  const prefix = conselho ?? CONSELHO_PROFISSIONAL.OUTRO;
  return `${prefix} ${parsed.numero}/${parsed.uf}`;
}

/** Mensagem determinística pt-BR explicando por que um registro é inválido. */
export function registrationErrorMessage(value: string): string | null {
  const trimmed = value.trim();
  if (trimmed.length === 0) return "Informe o número e a UF do registro profissional.";
  if (parseRegistration(trimmed) === null) {
    return "Informe o registro no formato número/UF (ex.: 123456/MT).";
  }
  return null;
}
