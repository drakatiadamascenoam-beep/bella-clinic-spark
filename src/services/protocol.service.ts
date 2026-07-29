import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

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
