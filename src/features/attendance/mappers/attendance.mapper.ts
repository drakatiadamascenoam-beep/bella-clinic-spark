import { toAttendanceStatus, type AttendanceStatus } from "../domain/attendance-status";
import type { AttendanceSessionInput } from "../domain/attendance-validation";
import type { AttendanceFormData } from "../types/attendance-form.types";
import type {
  Attendance,
  AttendanceFiltersInput,
  AttendanceListResult,
  AttendanceStatusFilter,
} from "../types/attendance.types";

/**
 * Mapper do módulo de Atendimento.
 *
 * Adaptação EXCLUSIVA entre o schema físico e o contrato de domínio.
 * Vive fora de `attendance.service.ts` porque arquivos que declaram
 * `createServerFn` são divididos pelo bundler — helpers irmãos seriam
 * removidos do chunk servidor (ReferenceError em runtime).
 */

export const ATTENDANCE_TABLE = "atendimentos";
export const ATTENDANCE_PAGE_SIZE = 20;

export type AttendanceWritePayload = Record<string, string | null>;

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

/** Normaliza a linha física para o modelo de domínio consumido pela UI. */
export function normalizeAttendance(row: unknown): Attendance | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const id = pick(record, ["id", "atendimento_id", "uuid"]);
  if (!id) return null;

  return {
    id,
    pacienteId: pick(record, ["paciente_id", "patient_id"]),
    pacienteNome: pick(record, ["paciente_nome", "nome_paciente", "paciente", "patient"]),
    protocoloId: pick(record, ["protocolo_id", "protocol_id"]),
    protocoloNome: pick(record, ["protocolo_nome", "nome_protocolo", "protocolo", "protocol"]),
    dataAtendimento: pick(record, ["data_atendimento", "data", "scheduled_at", "started_at"]),
    status: toAttendanceStatus(record.status ?? record.situacao),
    queixaPrincipal: pick(record, ["queixa_principal", "queixa", "chief_complaint"]),
    evolucaoClinica: pick(record, ["evolucao_clinica", "evolucao", "clinical_notes"]),
    observacoesPrescricoes: pick(record, [
      "observacoes_prescricoes",
      "prescricoes",
      "observacoes",
    ]),
    createdAt: pick(record, ["created_at", "criado_em"]),
    updatedAt: pick(record, ["updated_at", "atualizado_em"]),
  };
}

export function sanitizeSearch(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[,()%*]/g, " ").trim().slice(0, 80);
}

function parseStatusFilter(value: unknown): AttendanceStatusFilter {
  if (value === "all" || value === undefined || value === null) return "all";
  return toAttendanceStatus(value);
}

export function parseAttendanceFilters(input: unknown): AttendanceFiltersInput {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const page = Number(record.page);

  return {
    search: sanitizeSearch(record.search),
    status: parseStatusFilter(record.status),
    page: Number.isFinite(page) && page > 0 ? Math.floor(page) : 1,
  };
}

export function parseAttendanceId(input: unknown): { id: string } {
  const record = (typeof input === "object" && input !== null ? input : {}) as Record<
    string,
    unknown
  >;
  const id = toStringOrNull(record.id);
  if (!id) throw new Error("Identificador do atendimento é obrigatório.");
  return { id };
}

export function emptyAttendanceList(filters: AttendanceFiltersInput): AttendanceListResult {
  return {
    items: [],
    total: 0,
    page: filters.page,
    pageSize: ATTENDANCE_PAGE_SIZE,
    sourceUnavailable: true,
  };
}

/** Busca unificada por nome do paciente ou nome do protocolo. */
export function buildAttendanceSearchFilter(search: string): string {
  return [
    `paciente_nome.ilike.%${search}%`,
    `protocolo_nome.ilike.%${search}%`,
    `queixa_principal.ilike.%${search}%`,
  ].join(",");
}

/** Contrato de formulário → entrada do domínio puro. */
export function toSessionInput(values: AttendanceFormData): AttendanceSessionInput {
  return {
    pacienteId: values.paciente_id,
    protocoloId: toStringOrNull(values.protocolo_id),
    dataAtendimento: values.data_atendimento,
    queixaPrincipal: toStringOrNull(values.queixa_principal),
    evolucaoClinica: values.evolucao_clinica,
    observacoesPrescricoes: toStringOrNull(values.observacoes_prescricoes),
  };
}

function toIsoOrNull(value: string): string | null {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

/** Contrato de domínio → payload físico. */
export function toAttendancePayload(
  values: AttendanceFormData,
  status?: AttendanceStatus,
): AttendanceWritePayload {
  const payload: AttendanceWritePayload = {
    paciente_id: toStringOrNull(values.paciente_id),
    protocolo_id: toStringOrNull(values.protocolo_id),
    data_atendimento: toIsoOrNull(values.data_atendimento),
    queixa_principal: toStringOrNull(values.queixa_principal),
    evolucao_clinica: toStringOrNull(values.evolucao_clinica),
    observacoes_prescricoes: toStringOrNull(values.observacoes_prescricoes),
  };
  if (status) payload.status = status;
  return payload;
}
