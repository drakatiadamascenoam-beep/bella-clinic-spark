import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  protocolFormSchema,
  type ProtocolFormValues,
} from "@/features/knowledge/types/protocol-form";
import {
  canTransition,
  nextVersion,
  transitionErrorMessage,
  type ProtocolLifecycleStatus,
  type ProtocolVersionType,
} from "@/features/knowledge/types/protocol-lifecycle";

/**
 * Protocol service — Central do Conhecimento / Protocolos Mestres
 *
 * Database First: toda leitura acontece no servidor, autenticada e sujeita à RLS.
 * Nenhum dado é mockado. Enquanto a fonte `protocols` do Bella Knowledge Graph v3.0
 * não existir nesta instância, o serviço devolve `sourceUnavailable: true` e a UI
 * exibe o Empty State correspondente.
 */

const PROTOCOLS_TABLE = "protocols";

export const PROTOCOL_PAGE_SIZE = 20;

export type ProtocolStatus = "active" | "draft" | "archived" | "unknown";

export interface Protocol {
  id: string;
  name: string;
  code: string | null;
  category: string | null;
  status: ProtocolStatus;
  version: string | null;
  summary: string | null;
  indications: string | null;
  contraindications: string | null;
  updatedAt: string | null;
  createdAt: string | null;
}

export interface ProtocolFiltersInput {
  search: string;
  status: ProtocolStatus | "all";
  category: string | "all";
  page: number;
}

export interface ProtocolListResult {
  items: Protocol[];
  total: number;
  page: number;
  pageSize: number;
  categories: string[];
  /** true quando a tabela de protocolos ainda não existe / não é legível. */
  sourceUnavailable: boolean;
}

/* -------------------------------------------------------------------------- */
/* Tipagem mínima do client (o schema público ainda não gera tipos)            */
/* -------------------------------------------------------------------------- */

interface QueryError {
  message: string;
  code?: string;
}

interface QueryResult {
  data: unknown;
  count: number | null;
  error: QueryError | null;
}

type ProtocolWritePayload = Record<string, string | null>;

interface QueryBuilder extends PromiseLike<QueryResult> {
  select(columns: string, options?: { count?: "exact"; head?: boolean }): QueryBuilder;
  eq(column: string, value: string | number | boolean): QueryBuilder;
  or(filters: string): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  range(from: number, to: number): QueryBuilder;
  limit(count: number): QueryBuilder;
  insert(values: ProtocolWritePayload): QueryBuilder;
  update(values: ProtocolWritePayload): QueryBuilder;
  maybeSingle(): PromiseLike<QueryResult>;
}

interface MinimalSupabaseClient {
  from(table: string): QueryBuilder;
}

/* -------------------------------------------------------------------------- */
/* Normalizadores                                                              */
/* -------------------------------------------------------------------------- */

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function normalizeStatus(value: unknown, isActive: unknown): ProtocolStatus {
  const raw = typeof value === "string" ? value.toLowerCase() : null;
  if (raw === "active" || raw === "ativo" || raw === "published") return "active";
  if (raw === "draft" || raw === "rascunho") return "draft";
  if (raw === "archived" || raw === "arquivado" || raw === "inactive") return "archived";
  if (typeof isActive === "boolean") return isActive ? "active" : "archived";
  return "unknown";
}

function normalizeProtocol(row: unknown): Protocol | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const id = toStringOrNull(record.id);
  if (!id) return null;

  return {
    id,
    name: toStringOrNull(record.name) ?? toStringOrNull(record.title) ?? "Protocolo sem nome",
    code: toStringOrNull(record.code) ?? toStringOrNull(record.slug),
    category: toStringOrNull(record.category) ?? toStringOrNull(record.specialty),
    status: normalizeStatus(record.status, record.is_active),
    version: toStringOrNull(record.version),
    summary: toStringOrNull(record.summary) ?? toStringOrNull(record.description),
    indications: toStringOrNull(record.indications),
    contraindications: toStringOrNull(record.contraindications),
    updatedAt: toStringOrNull(record.updated_at),
    createdAt: toStringOrNull(record.created_at),
  };
}

function sanitizeSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[,()%*]/g, " ").trim().slice(0, 80);
}

function parseFilters(input: unknown): ProtocolFiltersInput {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const status = record.status;
  const category = record.category;
  const page = Number(record.page);

  return {
    search: sanitizeSearch(record.search),
    status:
      status === "active" || status === "draft" || status === "archived" || status === "unknown"
        ? status
        : "all",
    category: typeof category === "string" && category.length > 0 ? category : "all",
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

const EMPTY_RESULT = (filters: ProtocolFiltersInput): ProtocolListResult => ({
  items: [],
  total: 0,
  page: filters.page,
  pageSize: PROTOCOL_PAGE_SIZE,
  categories: [],
  sourceUnavailable: true,
});

/* -------------------------------------------------------------------------- */
/* Server functions                                                            */
/* -------------------------------------------------------------------------- */

export const listProtocols = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseFilters)
  .handler(async ({ context, data }): Promise<ProtocolListResult> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const from = (data.page - 1) * PROTOCOL_PAGE_SIZE;

    try {
      let query = client
        .from(PROTOCOLS_TABLE)
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(from, from + PROTOCOL_PAGE_SIZE - 1);

      if (data.search.length > 0) {
        query = query.or(`name.ilike.%${data.search}%,code.ilike.%${data.search}%`);
      }
      if (data.status !== "all") {
        query = query.eq("status", data.status);
      }
      if (data.category !== "all") {
        query = query.eq("category", data.category);
      }

      const { data: rows, count, error } = await query;
      if (error || !Array.isArray(rows)) return EMPTY_RESULT(data);

      const items = rows
        .map(normalizeProtocol)
        .filter((item): item is Protocol => item !== null);

      const categories = Array.from(
        new Set(items.map((item) => item.category).filter((c): c is string => c !== null)),
      ).sort((a, b) => a.localeCompare(b, "pt-BR"));

      return {
        items,
        total: count ?? items.length,
        page: data.page,
        pageSize: PROTOCOL_PAGE_SIZE,
        categories,
        sourceUnavailable: false,
      };
    } catch {
      return EMPTY_RESULT(data);
    }
  });

export const getProtocolById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): { id: string } => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do protocolo é obrigatório.");
    return { id };
  })
  .handler(async ({ context, data }): Promise<Protocol | null> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    try {
      const { data: row, error } = await client
        .from(PROTOCOLS_TABLE)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error) return null;
      return normalizeProtocol(row);
    } catch {
      return null;
    }
  });

/* -------------------------------------------------------------------------- */
/* Escrita                                                                     */
/* -------------------------------------------------------------------------- */

function toPayload(values: ProtocolFormValues): ProtocolWritePayload {
  return {
    name: values.name,
    code: values.code.length > 0 ? values.code : null,
    category: values.category.length > 0 ? values.category : null,
    version: values.version.length > 0 ? values.version : null,
    status: values.status,
    summary: values.summary.length > 0 ? values.summary : null,
    indications: values.indications.length > 0 ? values.indications : null,
    contraindications: values.contraindications.length > 0 ? values.contraindications : null,
  };
}

export const createProtocol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): ProtocolFormValues => protocolFormSchema.parse(input))
  .handler(async ({ context, data }): Promise<Protocol> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    const { data: row, error } = await client
      .from(PROTOCOLS_TABLE)
      .insert(toPayload(data))
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const protocol = normalizeProtocol(row);
    if (!protocol) throw new Error("Não foi possível criar o protocolo.");
    return protocol;
  });

export const updateProtocol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): ProtocolFormValues & { id: string } => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do protocolo é obrigatório.");
    return { ...protocolFormSchema.parse(record), id };
  })
  .handler(async ({ context, data }): Promise<Protocol> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const { id, ...values } = data;

    const { data: row, error } = await client
      .from(PROTOCOLS_TABLE)
      .update(toPayload(values))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const protocol = normalizeProtocol(row);
    if (!protocol) throw new Error("Não foi possível atualizar o protocolo.");
    return protocol;
  });

/* -------------------------------------------------------------------------- */
/* Ciclo de vida, duplicação e versionamento                                   */
/* -------------------------------------------------------------------------- */

async function loadProtocolOrThrow(
  client: MinimalSupabaseClient,
  id: string,
): Promise<Protocol> {
  const { data: row, error } = await client
    .from(PROTOCOLS_TABLE)
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  const protocol = normalizeProtocol(row);
  if (!protocol) throw new Error("Protocolo não encontrado.");
  return protocol;
}

function isLifecycleStatus(value: unknown): value is ProtocolLifecycleStatus {
  return value === "draft" || value === "active" || value === "archived";
}

function isVersionType(value: unknown): value is ProtocolVersionType {
  return value === "MAJOR" || value === "MINOR" || value === "PATCH";
}

function readRecord(input: unknown): Record<string, unknown> {
  return (typeof input === "object" && input !== null ? input : {}) as Record<string, unknown>;
}

export interface ProtocolVersionResult {
  protocol: Protocol;
  /**
   * O schema atual do Bella Knowledge Graph v3.0 não expõe tabela de histórico de
   * versões. A versão vigente é persistida; o log de alterações não é armazenado.
   */
  changeLogPersisted: boolean;
}

export const updateProtocolStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): { id: string; status: ProtocolLifecycleStatus } => {
    const record = readRecord(input);
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do protocolo é obrigatório.");
    if (!isLifecycleStatus(record.status)) throw new Error("Status inválido.");
    return { id, status: record.status };
  })
  .handler(async ({ context, data }): Promise<Protocol> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const current = await loadProtocolOrThrow(client, data.id);

    if (current.status === data.status) return current;
    if (!canTransition(current.status, data.status)) {
      throw new Error(transitionErrorMessage(current.status, data.status));
    }

    const { data: row, error } = await client
      .from(PROTOCOLS_TABLE)
      .update({ status: data.status })
      .eq("id", data.id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const updated = normalizeProtocol(row);
    if (!updated) throw new Error("Não foi possível atualizar o status do protocolo.");
    return updated;
  });

export const duplicateProtocol = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): { id: string; name: string | null; code: string | null } => {
    const record = readRecord(input);
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do protocolo é obrigatório.");
    return {
      id,
      name: toStringOrNull(record.name),
      code: toStringOrNull(record.code),
    };
  })
  .handler(async ({ context, data }): Promise<Protocol> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const source = await loadProtocolOrThrow(client, data.id);

    const payload: ProtocolWritePayload = {
      name: (data.name ?? `${source.name} (cópia)`).slice(0, 160),
      code: data.code ? data.code.slice(0, 40) : null,
      category: source.category,
      version: source.version,
      status: "draft",
      summary: source.summary,
      indications: source.indications,
      contraindications: source.contraindications,
    };

    const { data: row, error } = await client
      .from(PROTOCOLS_TABLE)
      .insert(payload)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const created = normalizeProtocol(row);
    if (!created) throw new Error("Não foi possível duplicar o protocolo.");
    return created;
  });

export const createProtocolVersion = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: unknown): { id: string; versionType: ProtocolVersionType; changes: string } => {
      const record = readRecord(input);
      const id = toStringOrNull(record.id);
      if (!id) throw new Error("Identificador do protocolo é obrigatório.");
      if (!isVersionType(record.versionType)) throw new Error("Tipo de versão inválido.");
      const changes = typeof record.changes === "string" ? record.changes.trim() : "";
      if (changes.length < 10) {
        throw new Error("Descreva as alterações com pelo menos 10 caracteres.");
      }
      return { id, versionType: record.versionType, changes: changes.slice(0, 2000) };
    },
  )
  .handler(async ({ context, data }): Promise<ProtocolVersionResult> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const current = await loadProtocolOrThrow(client, data.id);
    const version = nextVersion(current.version, data.versionType);

    const { data: row, error } = await client
      .from(PROTOCOLS_TABLE)
      .update({ version })
      .eq("id", data.id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const updated = normalizeProtocol(row);
    if (!updated) throw new Error("Não foi possível registrar a nova versão.");

    // Sem tabela de histórico no schema atual: o log de alterações não é persistido.
    return { protocol: updated, changeLogPersisted: false };
  });
