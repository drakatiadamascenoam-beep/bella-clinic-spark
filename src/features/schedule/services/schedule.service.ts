import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { INITIAL_SCHEDULE_STATUS, toScheduleStatus } from "../domain/schedule-status";
import { applyTransition } from "../domain/schedule-flow";
import { assertSchedulable } from "../domain/schedule-conflict";
import { scheduleSchema } from "../types/schedule-form.types";
import type { ScheduleFormData } from "../types/schedule-form.types";
import type {
  Appointment,
  ScheduleListResult,
  ScheduleStatusChangeInput,
} from "../types/schedule.types";
import {
  SCHEDULE_START_COLUMN,
  SCHEDULE_TABLE,
  emptyScheduleList,
  normalizeAppointment,
  parseScheduleFilters,
  parseScheduleId,
  toDateKey,
  toDayRange,
  toSchedulePayload,
  toScheduleSlot,
  toStringOrNull,
  type ScheduleWritePayload,
} from "../mappers/schedule.mapper";

/**
 * Schedule service — orquestrador central da Agenda Clínica.
 *
 * Coordena o mapper (schema físico ↔ contrato de domínio) e as regras puras
 * de /domain (status, máquina de estados, conflitos de horário).
 *
 * Database First: nenhuma persistência é simulada. Enquanto a fonte
 * `agendamentos` do BKG v3.0 não existir, a listagem devolve
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
  gte(column: string, value: string): QueryBuilder;
  lte(column: string, value: string): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  insert(values: ScheduleWritePayload): QueryBuilder;
  update(values: ScheduleWritePayload): QueryBuilder;
  maybeSingle(): PromiseLike<QueryResult>;
}

interface MinimalSupabaseClient {
  from(table: string): QueryBuilder;
}

export const getAgendamentos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseScheduleFilters)
  .handler(async ({ context, data }): Promise<ScheduleListResult> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const range = toDayRange(data.date);

    try {
      let query = client
        .from(SCHEDULE_TABLE)
        .select("*", { count: "exact" })
        .gte(SCHEDULE_START_COLUMN, range.from)
        .lte(SCHEDULE_START_COLUMN, range.to)
        .order(SCHEDULE_START_COLUMN, { ascending: true });

      if (data.status !== "all") {
        query = query.eq("status", data.status);
      }

      const { data: rows, count, error } = await query;
      if (error || !Array.isArray(rows)) return emptyScheduleList(data);

      const items = rows
        .map(normalizeAppointment)
        .filter((item): item is Appointment => item !== null);

      return {
        items,
        total: count ?? items.length,
        date: data.date,
        sourceUnavailable: false,
      };
    } catch {
      return emptyScheduleList(data);
    }
  });

export const getAgendamentoById = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(parseScheduleId)
  .handler(async ({ context, data }): Promise<Appointment | null> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    try {
      const { data: row, error } = await client
        .from(SCHEDULE_TABLE)
        .select("*")
        .eq("id", data.id)
        .maybeSingle();

      if (error) return null;
      return normalizeAppointment(row);
    } catch {
      return null;
    }
  });

export const createAgendamento = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): ScheduleFormData => scheduleSchema.parse(input))
  .handler(async ({ context, data }): Promise<Appointment> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const startsAt = new Date(data.data_hora_inicio).toISOString();
    const range = toDayRange(toDateKey(new Date(data.data_hora_inicio)));

    const { data: dayRows } = await client
      .from(SCHEDULE_TABLE)
      .select("*")
      .gte(SCHEDULE_START_COLUMN, range.from)
      .lte(SCHEDULE_START_COLUMN, range.to)
      .order(SCHEDULE_START_COLUMN, { ascending: true });

    const existing = (Array.isArray(dayRows) ? dayRows : [])
      .map(normalizeAppointment)
      .filter((item): item is Appointment => item !== null)
      .map(toScheduleSlot);

    assertSchedulable(
      { startsAt, durationMinutes: data.duracao_minutos },
      existing,
    );

    const { data: row, error } = await client
      .from(SCHEDULE_TABLE)
      .insert(toSchedulePayload(data, INITIAL_SCHEDULE_STATUS))
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const appointment = normalizeAppointment(row);
    if (!appointment) throw new Error("Não foi possível criar o agendamento.");
    return appointment;
  });

export const updateAgendamentoStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): ScheduleStatusChangeInput => {
    const record = (typeof input === "object" && input !== null ? input : {}) as Record<
      string,
      unknown
    >;
    const id = toStringOrNull(record.id);
    if (!id) throw new Error("Identificador do agendamento é obrigatório.");
    return { id, status: toScheduleStatus(record.status) };
  })
  .handler(async ({ context, data }): Promise<Appointment> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;

    const { data: currentRow } = await client
      .from(SCHEDULE_TABLE)
      .select("*")
      .eq("id", data.id)
      .maybeSingle();

    const current = normalizeAppointment(currentRow);
    if (!current) throw new Error("Agendamento não encontrado.");

    const nextStatus = applyTransition(current.status, data.status);

    const { data: row, error } = await client
      .from(SCHEDULE_TABLE)
      .update({ status: nextStatus })
      .eq("id", data.id)
      .select("*")
      .maybeSingle();

    if (error) throw new Error(error.message);
    const appointment = normalizeAppointment(row);
    if (!appointment) throw new Error("Não foi possível alterar o status do compromisso.");
    return appointment;
  });
