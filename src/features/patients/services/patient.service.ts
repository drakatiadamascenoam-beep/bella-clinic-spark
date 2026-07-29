import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { patientSchema } from "../types/patient-form.types";
import type { PatientFormData } from "../types/patient-form.types";
import type { Patient, PatientListResult, PatientUpdateInput } from "../types/patient.types";
import {
  PATIENT_PAGE_SIZE,
  PATIENT_TABLE,
  buildSearchFilter,
  emptyPatientList,
  normalizePatient,
  parsePatientFilters,
  parsePatientId,
  toPatientPayload,
  toStringOrNull,
  type PatientWritePayload,
} from "./patient.mapper";

/**
 * Patient service — Módulo de Pacientes (Bella Knowledge Graph v3.0).
 *
 * Database First: toda leitura/escrita acontece no servidor, autenticada e
 * sujeita à RLS. Nenhum dado é mockado. Enquanto a fonte `pacientes` não
 * existir nesta instância, a listagem devolve `sourceUnavailable: true`.
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
  insert(values: PatientWritePayload): QueryBuilder;
  update(values: PatientWritePayload): QueryBuilder;
  maybeSingle(): PromiseLike<QueryResult>;
}

interface MinimalSupabaseClient {
  from(table: string): QueryBuilder;
}

export const getPacientes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parsePatientFilters)
  .handler(async ({ context, data }): Promise<PatientListResult> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const from = (data.page - 1) * PATIENT_PAGE_SIZE;

    try {
      let query = client
        .from(PATIENT_TABLE)
        .select("*", { count: "exact" })
        .order(data.sortBy, { ascending: data.sortDir === "asc" })
        .range(from, from + PATIENT_PAGE_SIZE - 1);

      if (data.search.length > 0) {
        query = query.or(buildSearchFilter(data.search));
      }

      const { data: rows, count, error } = await query;
      if (error || !Array.isArray(rows)) return emptyPatientList(data);

      const items = rows
        .map(normalizePatient)
        .filter((item): item is Patient => item !== null);

      return {
        items,
        total: count ?? items.length,
        page: data.page,
        pageSize: PATIENT_PAGE_SIZE,
        sourceUnavailable: false,
      };
    } catch {
      return emptyPatientList(data);
    }
  });

export const getPacienteById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parsePatientId)
  .handler(async ({ context, data }): Promise<Patient | null> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    try {
      const { data: row, error } = await client
        .from(PATIENT_TABLE)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error) return null;
      return normalizePatient(row);
    } catch {
      return null;
    }
  });

export const createPaciente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): PatientFormData => patientSchema.parse(input))
  .handler(async ({ context, data }): Promise<Patient> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    const { data: row, error } = await client
      .from(PATIENT_TABLE)
      .insert(toPatientPayload(data))
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const patient = normalizePatient(row);
    if (!patient) throw new Error("Não foi possível cadastrar o paciente.");
    return patient;
  });

export const updatePaciente = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): PatientUpdateInput => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do paciente é obrigatório.");
    const values = patientSchema.partial().parse({ ...record, id: undefined });
    return { ...values, id };
  })
  .handler(async ({ context, data }): Promise<Patient> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const { id, ...values } = data;

    const { data: row, error } = await client
      .from(PATIENT_TABLE)
      .update(toPatientPayload(values))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const patient = normalizePatient(row);
    if (!patient) throw new Error("Não foi possível atualizar o paciente.");
    return patient;
  });
