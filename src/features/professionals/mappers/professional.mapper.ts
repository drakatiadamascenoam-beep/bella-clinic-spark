import { toConselho } from "../domain/professional-role";
import { toProfessionalRole } from "../domain/professional-role";
import type {
  Professional,
  ProfessionalFiltersInput,
  ProfessionalListResult,
  ProfessionalRoleFilter,
} from "../types/professional.types";
import type { ProfessionalFormData } from "../types/professional-form.types";

/**
 * Helpers puros do módulo de Profissionais.
 *
 * Vivem fora de `professional.service.ts` porque arquivos que declaram
 * `createServerFn` são divididos pelo bundler — helpers irmãos seriam
 * removidos do chunk servidor (ReferenceError em runtime).
 */

export const PROFESSIONAL_TABLE = "profissionais";
export const PROFESSIONAL_PAGE_SIZE = 20;

export type ProfessionalWritePayload = Record<string, string | boolean | string[] | null>;

export function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function pick(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = toStringOrNull(record[key]);
    if (value !== null) return value;
  }
  return null;
}

function pickBoolean(record: Record<string, unknown>, keys: string[], fallback: boolean): boolean {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "boolean") return value;
  }
  return fallback;
}

function pickArray(record: Record<string, unknown>, keys: string[]): string[] {
  for (const key of keys) {
    const value = record[key];
    if (Array.isArray(value)) {
      return value.filter((item): item is string => typeof item === "string");
    }
  }
  return [];
}

/** Normaliza o contrato do banco (colunas físicas tolerantes) para o modelo de domínio. */
export function normalizeProfessional(row: unknown): Professional | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const id = pick(record, ["id", "profissional_id", "uuid"]);
  if (!id) return null;

  return {
    id,
    nome: pick(record, ["nome", "nome_completo", "name", "full_name"]) ?? "Profissional sem nome",
    papelClinico: toProfessionalRole(record.papel_clinico ?? record.papel ?? record.role),
    conselhoProfissional: (() => {
      const value = record.conselho_profissional ?? record.conselho;
      return value === undefined || value === null || value === "" ? null : toConselho(value);
    })(),
    registroProfissional: pick(record, ["registro_profissional", "registro", "numero_registro"]),
    especialidade: pick(record, ["especialidade", "especialidades"]),
    email: pick(record, ["email", "e_mail"]),
    telefone: pick(record, ["telefone", "celular", "phone"]),
    diasAtendimento: pickArray(record, ["dias_atendimento", "dias_trabalho", "weekdays"]),
    horarioInicio: pick(record, ["horario_inicio", "jornada_inicio", "hora_inicio"]) ?? "09:00",
    horarioFim: pick(record, ["horario_fim", "jornada_fim", "hora_fim"]) ?? "18:00",
    intervaloInicio: pick(record, ["intervalo_inicio", "pausa_inicio"]),
    intervaloFim: pick(record, ["intervalo_fim", "pausa_fim"]),
    ativo: pickBoolean(record, ["ativo", "is_active", "active"], true),
    createdAt: pick(record, ["created_at", "criado_em"]),
    updatedAt: pick(record, ["updated_at", "atualizado_em"]),
  };
}

function parseRoleFilter(value: unknown): ProfessionalRoleFilter {
  if (value === "all" || value === undefined || value === null || value === "") return "all";
  return toProfessionalRole(value);
}

export function sanitizeSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[,()%*]/g, " ").trim().slice(0, 80);
}

export function parseProfessionalFilters(input: unknown): ProfessionalFiltersInput {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  return {
    search: sanitizeSearch(record.search),
    role: parseRoleFilter(record.role),
  };
}

export function parseProfessionalId(input: unknown): { id: string } {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const id = toStringOrNull(record.id);
  if (!id) throw new Error("Identificador do profissional é obrigatório.");
  return { id };
}

/** Busca unificada: nome, especialidade e registro profissional. */
export function buildSearchFilter(search: string): string {
  return [
    `nome.ilike.%${search}%`,
    `especialidade.ilike.%${search}%`,
    `registro_profissional.ilike.%${search}%`,
  ].join(",");
}

export function emptyProfessionalList(): ProfessionalListResult {
  return { items: [], total: 0, sourceUnavailable: true };
}

function normalizeOptional(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Converte o modelo do formulário para o payload físico da tabela. */
export function toProfessionalPayload(
  values: Partial<ProfessionalFormData>,
): ProfessionalWritePayload {
  const payload: ProfessionalWritePayload = {};
  const assign = (column: string, value: string | boolean | string[] | null | undefined) => {
    if (value !== undefined) payload[column] = value;
  };

  if (values.nome !== undefined) payload.nome = values.nome.trim();
  if (values.papel_clinico !== undefined) payload.papel_clinico = values.papel_clinico;
  assign("conselho_profissional", normalizeOptional(values.conselho_profissional));
  assign("registro_profissional", normalizeOptional(values.registro_profissional));
  assign("especialidade", normalizeOptional(values.especialidade));
  assign("email", normalizeOptional(values.email));
  assign("telefone", normalizeOptional(values.telefone));
  if (values.dias_atendimento !== undefined) payload.dias_atendimento = values.dias_atendimento;
  if (values.horario_inicio !== undefined) payload.horario_inicio = values.horario_inicio;
  if (values.horario_fim !== undefined) payload.horario_fim = values.horario_fim;
  assign("intervalo_inicio", normalizeOptional(values.intervalo_inicio));
  assign("intervalo_fim", normalizeOptional(values.intervalo_fim));
  if (values.ativo !== undefined) payload.ativo = values.ativo;

  return payload;
}
