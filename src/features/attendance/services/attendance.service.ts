import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { INITIAL_ATTENDANCE_STATUS } from "../domain/attendance-status";
import { applyTransition } from "../domain/attendance-flow";
import { assertSessionOpen, assertValidSession } from "../domain/attendance-validation";
import { attendanceSchema } from "../types/attendance-form.types";
import type { AttendanceFormData } from "../types/attendance-form.types";
import type {
  Attendance,
  AttendanceListResult,
  AttendanceStatusChangeInput,
  AttendanceUpdateInput,
} from "../types/attendance.types";
import {
  ATTENDANCE_PAGE_SIZE,
  ATTENDANCE_TABLE,
  buildAttendanceSearchFilter,
  emptyAttendanceList,
  normalizeAttendance,
  parseAttendanceFilters,
  parseAttendanceId,
  toAttendancePayload,
  toSessionInput,
  toStringOrNull,
  type AttendanceWritePayload,
} from "../mappers/attendance.mapper";
import { toAttendanceStatus } from "../domain/attendance-status";

/**
 * Attendance service — orquestrador central do Atendimento Clínico.
 *
 * Coordena o mapper (schema físico ↔ contrato de domínio) e as regras puras
 * de /domain (status, máquina de estados, validação da sessão).
 *
 * Database First: nenhuma persistência é simulada. Enquanto a fonte
 * `atendimentos` do BKG v3.0 não existir, a listagem devolve
 * `sourceUnavailable: true` e as escritas falham com erro explícito.
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
  insert(values: AttendanceWritePayload): QueryBuilder;
  update(values: AttendanceWritePayload): QueryBuilder;
  maybeSingle(): PromiseLike<QueryResult>;
}

interface MinimalSupabaseClient {
  from(table: string): QueryBuilder;
}

export const getAtendimentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseAttendanceFilters)
  .handler(async ({ context, data }): Promise<AttendanceListResult> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const from = (data.page - 1) * ATTENDANCE_PAGE_SIZE;

    try {
      let query = client
        .from(ATTENDANCE_TABLE)
        .select("*", { count: "exact" })
        .order("data_atendimento", { ascending: false })
        .range(from, from + ATTENDANCE_PAGE_SIZE - 1);

      if (data.search.length > 0) {
        query = query.or(buildAttendanceSearchFilter(data.search));
      }
      if (data.status !== "all") {
        query = query.eq("status", data.status);
      }

      const { data: rows, count, error } = await query;
      if (error || !Array.isArray(rows)) return emptyAttendanceList(data);

      const items = rows
        .map(normalizeAttendance)
        .filter((item): item is Attendance => item !== null);

      return {
        items,
        total: count ?? items.length,
        page: data.page,
        pageSize: ATTENDANCE_PAGE_SIZE,
        sourceUnavailable: false,
      };
    } catch {
      return emptyAttendanceList(data);
    }
  });

export const getAtendimentoById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseAttendanceId)
  .handler(async ({ context, data }): Promise<Attendance | null> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    try {
      const { data: row, error } = await client
        .from(ATTENDANCE_TABLE)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error) return null;
      return normalizeAttendance(row);
    } catch {
      return null;
    }
  });

export const createAtendimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): AttendanceFormData => attendanceSchema.parse(input))
  .handler(async ({ context, data }): Promise<Attendance> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    assertValidSession(toSessionInput(data));

    const { data: row, error } = await client
      .from(ATTENDANCE_TABLE)
      .insert(toAttendancePayload(data, INITIAL_ATTENDANCE_STATUS))
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const attendance = normalizeAttendance(row);
    if (!attendance) throw new Error("Não foi possível abrir o atendimento.");
    return attendance;
  });

export const updateAtendimento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): AttendanceUpdateInput => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do atendimento é obrigatório.");
    return { ...attendanceSchema.parse({ ...record, id: undefined }), id };
  })
  .handler(async ({ context, data }): Promise<Attendance> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const { id, ...values } = data;

    const { data: currentRow } = await client
      .from(ATTENDANCE_TABLE)
      .select("*")
      .eq("id", id)
      .maybeSingle();

    const current = normalizeAttendance(currentRow);
    if (!current) throw new Error("Atendimento não encontrado.");

    assertSessionOpen(current.status);
    assertValidSession(toSessionInput(values));

    const { data: row, error } = await client
      .from(ATTENDANCE_TABLE)
      .update(toAttendancePayload(values))
      .eq("id", id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const attendance = normalizeAttendance(row);
    if (!attendance) throw new Error("Não foi possível salvar a evolução do atendimento.");
    return attendance;
  });

export const changeAtendimentoStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): AttendanceStatusChangeInput => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do atendimento é obrigatório.");
    return { id, status: toAttendanceStatus(record.status) };
  })
  .handler(async ({ context, data }): Promise<Attendance> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    const { data: currentRow } = await client
      .from(ATTENDANCE_TABLE)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const current = normalizeAttendance(currentRow);
    if (!current) throw new Error("Atendimento não encontrado.");

    const nextStatus = applyTransition(current.status, data.status);

    const { data: row, error } = await client
      .from(ATTENDANCE_TABLE)
      .update({ status: nextStatus })
      .eq("id", data.id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const attendance = normalizeAttendance(row);
    if (!attendance) throw new Error("Não foi possível alterar o status do atendimento.");
    return attendance;
  });
