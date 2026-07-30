import type { ScheduleSlot } from "../domain/schedule-conflict";
import { DEFAULT_DURATION_MINUTES } from "../domain/schedule-conflict";
import { toScheduleStatus, type ScheduleStatus } from "../domain/schedule-status";
import type { ScheduleFormData } from "../types/schedule-form.types";
import type {
  Appointment,
  ScheduleFiltersInput,
  ScheduleListResult,
  ScheduleStatusFilter,
} from "../types/schedule.types";

/**
 * Mapper do módulo de Agenda.
 *
 * Adaptação EXCLUSIVA entre o schema físico e o contrato de domínio.
 * Vive fora de `schedule.service.ts` porque arquivos que declaram
 * `createServerFn` são divididos pelo bundler — helpers irmãos seriam
 * removidos do chunk servidor (ReferenceError em runtime).
 */

export const SCHEDULE_TABLE = "agendamentos";
export const SCHEDULE_START_COLUMN = "data_hora_inicio";

export type ScheduleWritePayload = Record<string, string | number | null>;

export function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function pick(record: Record<string, unknown>, keys: string[]): string | null {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" || typeof value === "number") {
      const normalized = toStringOrNull(String(value));
      if (normalized !== null) return normalized;
    }
    if (value !== null && typeof value === "object") {
      const nested = value as Record<string, unknown>;
      const label = toStringOrNull(
        typeof nested.nome === "string"
          ? nested.nome
          : typeof nested.name === "string"
            ? nested.name
            : null,
      );
      if (label !== null) return label;
    }
  }
  return null;
}

function pickNumber(record: Record<string, unknown>, keys: string[]): number | null {
  for (const key of keys) {
    const value = record[key];
    const parsed = typeof value === "number" ? value : Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return Math.round(parsed);
  }
  return null;
}

/** Normaliza a linha física para o modelo de domínio consumido pela UI. */
export function normalizeAppointment(row: unknown): Appointment | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const id = pick(record, ["id", "agendamento_id", "uuid"]);
  if (!id) return null;

  return {
    id,
    pacienteId: pick(record, ["paciente_id", "patient_id"]),
    pacienteNome: pick(record, ["paciente_nome", "nome_paciente", "paciente", "patient"]),
    protocoloId: pick(record, ["protocolo_id", "protocol_id"]),
    protocoloNome: pick(record, ["protocolo_nome", "nome_protocolo", "protocolo", "protocol"]),
    profissionalId: pick(record, ["profissional_id", "professional_id"]),
    profissionalNome: pick(record, [
      "profissional_nome",
      "nome_profissional",
      "profissional",
      "professional",
    ]),
    dataHoraInicio: pick(record, [
      "data_hora_inicio",
      "data_inicio",
      "inicio",
      "starts_at",
      "scheduled_at",
      "data",
    ]),
    duracaoMinutos:
      pickNumber(record, ["duracao_minutos", "duracao", "duration_minutes"]) ??
      DEFAULT_DURATION_MINUTES,
    status: toScheduleStatus(record.status ?? record.situacao),
    observacoes: pick(record, ["observacoes", "observacao", "notes"]),
    createdAt: pick(record, ["created_at", "criado_em"]),
    updatedAt: pick(record, ["updated_at", "atualizado_em"]),
  };
}

/** Contrato de domínio → entrada do domínio puro de conflitos. */
export function toScheduleSlot(appointment: Appointment): ScheduleSlot {
  return {
    id: appointment.id,
    startsAt: appointment.dataHoraInicio ?? "",
    durationMinutes: appointment.duracaoMinutos,
    status: appointment.status,
    label: appointment.pacienteNome,
  };
}

function parseStatusFilter(value: unknown): ScheduleStatusFilter {
  if (value === "all" || value === undefined || value === null) return "all";
  return toScheduleStatus(value);
}

/** Data local no formato YYYY-MM-DD. */
export function toDateKey(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function sanitizeDate(value: unknown): string {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.trim())) {
    return value.trim();
  }
  return toDateKey(new Date());
}

export function parseScheduleFilters(input: unknown): ScheduleFiltersInput {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  return {
    date: sanitizeDate(record.date),
    status: parseStatusFilter(record.status),
  };
}

export function parseScheduleId(input: unknown): { id: string } {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const id = toStringOrNull(record.id);
  if (!id) throw new Error("Identificador do agendamento é obrigatório.");
  return { id };
}

/** Limites ISO (início/fim) do dia informado, em horário local. */
export function toDayRange(dateKey: string): { from: string; to: string } {
  const start = new Date(`${dateKey}T00:00:00`);
  const end = new Date(start.getTime() + 24 * 60 * 60_000 - 1);
  return { from: start.toISOString(), to: end.toISOString() };
}

export function emptyScheduleList(filters: ScheduleFiltersInput): ScheduleListResult {
  return {
    items: [],
    total: 0,
    date: filters.date,
    sourceUnavailable: true,
  };
}

function toIsoOrNull(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Contrato de domínio → payload físico. */
export function toSchedulePayload(
  values: ScheduleFormData,
  status?: ScheduleStatus,
): ScheduleWritePayload {
  const payload: ScheduleWritePayload = {
    paciente_id: toStringOrNull(values.paciente_id),
    protocolo_id: toStringOrNull(values.protocolo_id),
    data_hora_inicio: toIsoOrNull(values.data_hora_inicio),
    duracao_minutos: values.duracao_minutos,
    observacoes: toStringOrNull(values.observacoes),
  };
  const profissionalId = toStringOrNull(values.profissional_id);
  if (profissionalId) payload.profissional_id = profissionalId;
  if (status) payload.status = status;
  return payload;
}
