import type {
  Patient,
  PatientFiltersInput,
  PatientListResult,
  PatientSortDirection,
  PatientSortField,
} from "../types/patient.types";
import type { PatientFormData } from "../types/patient-form.types";

/**
 * Helpers puros do módulo de Pacientes.
 *
 * Vivem fora de `patient.service.ts` porque arquivos que declaram
 * `createServerFn` são divididos pelo bundler — helpers irmãos seriam
 * removidos do chunk servidor (ReferenceError em runtime).
 */

export const PATIENT_TABLE = "pacientes";
export const PATIENT_PAGE_SIZE = 20;

/** Colunas físicas candidatas por campo de domínio (schema-tolerante). */
export type PatientWritePayload = Record<string, string | null>;

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

/** Normaliza o contrato do banco para o modelo de domínio da UI. */
export function normalizePatient(row: unknown): Patient | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const id = pick(record, ["id", "paciente_id", "uuid"]);
  if (!id) return null;

  return {
    id,
    nome: pick(record, ["nome", "nome_completo", "name", "full_name"]) ?? "Paciente sem nome",
    nomeSocial: pick(record, ["nome_social", "social_name"]),
    cpf: pick(record, ["cpf", "documento", "document"]),
    dataNascimento: pick(record, ["data_nascimento", "nascimento", "birth_date"]),
    telefone: pick(record, ["telefone", "celular", "phone"]),
    email: pick(record, ["email", "e_mail"]),
    sexo: pick(record, ["sexo", "genero", "gender"]),
    observacoesAlergias: pick(record, ["observacoes_alergias", "alergias", "observacoes"]),
    createdAt: pick(record, ["created_at", "criado_em"]),
    updatedAt: pick(record, ["updated_at", "atualizado_em"]),
  };
}

export function sanitizeSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[,()%*]/g, " ").trim().slice(0, 80);
}

export function parsePatientFilters(input: unknown): PatientFiltersInput {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const sortBy: PatientSortField = record.sortBy === "created_at" ? "created_at" : "nome";
  const sortDir: PatientSortDirection = record.sortDir === "desc" ? "desc" : "asc";
  const page = Number(record.page);

  return {
    search: sanitizeSearch(record.search),
    sortBy,
    sortDir,
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function parsePatientId(input: unknown): { id: string } {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const id = toStringOrNull(record.id);
  if (!id) throw new Error("Identificador do paciente é obrigatório.");
  return { id };
}

export function emptyPatientList(filters: PatientFiltersInput): PatientListResult {
  return {
    items: [],
    total: 0,
    page: filters.page,
    pageSize: PATIENT_PAGE_SIZE,
    sourceUnavailable: true,
  };
}

/** Busca unificada: nome, nome social, CPF, telefone e e-mail. */
export function buildSearchFilter(search: string): string {
  const digits = search.replace(/\D/g, "");
  const terms = [
    `nome.ilike.%${search}%`,
    `nome_social.ilike.%${search}%`,
    `email.ilike.%${search}%`,
  ];
  if (digits.length > 0) {
    terms.push(`cpf.ilike.%${digits}%`, `telefone.ilike.%${digits}%`);
  } else {
    terms.push(`cpf.ilike.%${search}%`, `telefone.ilike.%${search}%`);
  }
  return terms.join(",");
}

function normalizeOptional(value: string | undefined): string | null | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Converte o modelo do formulário para o payload físico da tabela. */
export function toPatientPayload(values: Partial<PatientFormData>): PatientWritePayload {
  const payload: PatientWritePayload = {};
  const assign = (column: string, value: string | null | undefined) => {
    if (value !== undefined) payload[column] = value;
  };

  if (values.nome !== undefined) payload.nome = values.nome.trim();
  assign("nome_social", normalizeOptional(values.nome_social));
  assign(
    "cpf",
    values.cpf === undefined ? undefined : normalizeOptional(values.cpf.replace(/\D/g, "")),
  );
  assign("data_nascimento", normalizeOptional(values.data_nascimento));
  assign("telefone", normalizeOptional(values.telefone));
  assign("email", normalizeOptional(values.email));
  assign("sexo", normalizeOptional(values.sexo));
  assign("observacoes_alergias", normalizeOptional(values.observacoes_alergias));

  return payload;
}
