import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { professionalSchema } from "../types/professional-form.types";
import type { ProfessionalFormData } from "../types/professional-form.types";
import type {
  Professional,
  ProfessionalListResult,
  ProfessionalUpdateInput,
} from "../types/professional.types";
import {
  PROFESSIONAL_PAGE_SIZE,
  PROFESSIONAL_TABLE,
  buildSearchFilter,
  emptyProfessionalList,
  normalizeProfessional,
  parseProfessionalFilters,
  parseProfessionalId,
  toProfessionalPayload,
  toStringOrNull,
  type ProfessionalWritePayload,
} from "../mappers/professional.mapper";

/**
 * Professional service — Módulo de Profissionais (Bella Knowledge Graph v3.0).
 *
 * Database First: toda leitura/escrita acontece no servidor, autenticada e
 * sujeita à RLS. Nenhum dado é mockado. Enquanto a fonte `profissionais` não
 * existir nesta instância, a listagem devolve `sourceUnavailable: true` e as
 * escritas falham com erro explícito.
 *
 * Este arquivo é um wrapper fino: apenas imports e server functions.
 */

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
  insert(values: ProfessionalWritePayload): QueryBuilder;
  update(values: ProfessionalWritePayload): QueryBuilder;
  maybeSingle(): PromiseLike<QueryResult>;
}

interface MinimalSupabaseClient {
  from(table: string): QueryBuilder;
}

export const getProfissionais = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseProfessionalFilters)
  .handler(async ({ context, data }): Promise<ProfessionalListResult> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    try {
      let query = client
        .from(PROFESSIONAL_TABLE)
        .select("*", { count: "exact" })
        .order("nome", { ascending: true })
        .range(0, PROFESSIONAL_PAGE_SIZE - 1);

      if (data.search.length > 0) {
        query = query.or(buildSearchFilter(data.search));
      }
      if (data.role !== "all") {
        query = query.eq("papel_clinico", data.role);
      }

      const { data: rows, count, error } = await query;
      if (error || !Array.isArray(rows)) return emptyProfessionalList();

      const items = rows
        .map(normalizeProfessional)
        .filter((item): item is Professional => item !== null);

      return { items, total: count ?? items.length, sourceUnavailable: false };
    } catch {
      return emptyProfessionalList();
    }
  });

export const getProfissionalById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseProfessionalId)
  .handler(async ({ context, data }): Promise<Professional | null> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    try {
      const { data: row, error } = await client
        .from(PROFESSIONAL_TABLE)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error) return null;
      return normalizeProfessional(row);
    } catch {
      return null;
    }
  });

export const createProfissional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): ProfessionalFormData => professionalSchema.parse(input))
  .handler(async ({ context, data }): Promise<Professional> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    const { data: row, error } = await client
      .from(PROFESSIONAL_TABLE)
      .insert(toProfessionalPayload(data))
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const professional = normalizeProfessional(row);
    if (!professional) throw new Error("Não foi possível cadastrar o profissional.");
    return professional;
  });

export const updateProfissional = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): ProfessionalUpdateInput => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do profissional é obrigatório.");
    const values = professionalSchema.parse({ ...record, id: undefined });
    return { ...values, id };
  })
  .handler(async ({ context, data }): Promise<Professional> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const { id, ...values } = data;

    const { data: row, error } = await client
      .from(PROFESSIONAL_TABLE)
      .update(toProfessionalPayload(values))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const professional = normalizeProfessional(row);
    if (!professional) throw new Error("Não foi possível atualizar o profissional.");
    return professional;
  });
