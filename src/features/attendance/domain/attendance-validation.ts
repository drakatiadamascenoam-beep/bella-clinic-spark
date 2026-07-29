import { ATTENDANCE_STATUS, type AttendanceStatus } from "./attendance-status";
import { isEditable } from "./attendance-flow";

/**
 * Domínio puro — Regras de validação da sessão de atendimento.
 *
 * Funções determinísticas, sem I/O. Pontos de extensão para validações
 * assistidas por IA estão declarados como contratos (`AttendanceValidator`),
 * porém NENHUMA chamada externa é feita nesta Sprint.
 */

export const MIN_EVOLUTION_LENGTH = 5;
export const MAX_EVOLUTION_LENGTH = 8000;

export interface AttendanceSessionInput {
  pacienteId: string;
  protocoloId: string | null;
  dataAtendimento: string;
  queixaPrincipal: string | null;
  evolucaoClinica: string;
  observacoesPrescricoes: string | null;
}

export type AttendanceIssueSeverity = "error" | "warning";

export interface AttendanceIssue {
  field: keyof AttendanceSessionInput | "status";
  severity: AttendanceIssueSeverity;
  message: string;
}

export interface AttendanceValidationResult {
  valid: boolean;
  issues: AttendanceIssue[];
}

/**
 * Ponto de extensão. Futuras validações assistidas por IA implementarão este
 * contrato e serão registradas via `runValidators`, sem alterar o núcleo.
 */
export type AttendanceValidator = (input: AttendanceSessionInput) => AttendanceIssue[];

function isIsoDateTime(value: string): boolean {
  if (value.trim().length === 0) return false;
  return !Number.isNaN(new Date(value).getTime());
}

/** Regras estruturais mínimas de uma sessão clínica. */
export const validateStructure: AttendanceValidator = (input) => {
  const issues: AttendanceIssue[] = [];

  if (input.pacienteId.trim().length === 0) {
    issues.push({
      field: "pacienteId",
      severity: "error",
      message: "Selecione o paciente da sessão.",
    });
  }

  if (!isIsoDateTime(input.dataAtendimento)) {
    issues.push({
      field: "dataAtendimento",
      severity: "error",
      message: "Informe uma data e hora de atendimento válidas.",
    });
  }

  const evolution = input.evolucaoClinica.trim();
  if (evolution.length < MIN_EVOLUTION_LENGTH) {
    issues.push({
      field: "evolucaoClinica",
      severity: "error",
      message: `A evolução clínica deve ter ao menos ${MIN_EVOLUTION_LENGTH} caracteres.`,
    });
  }
  if (evolution.length > MAX_EVOLUTION_LENGTH) {
    issues.push({
      field: "evolucaoClinica",
      severity: "error",
      message: `A evolução clínica excede ${MAX_EVOLUTION_LENGTH} caracteres.`,
    });
  }

  return issues;
};

/** Sinalizações não bloqueantes de qualidade do registro clínico. */
export const validateClinicalCompleteness: AttendanceValidator = (input) => {
  const issues: AttendanceIssue[] = [];

  if (input.protocoloId === null) {
    issues.push({
      field: "protocoloId",
      severity: "warning",
      message: "Sessão sem protocolo mestre vinculado.",
    });
  }

  if ((input.queixaPrincipal ?? "").trim().length === 0) {
    issues.push({
      field: "queixaPrincipal",
      severity: "warning",
      message: "Queixa principal não registrada.",
    });
  }

  return issues;
};

const DEFAULT_VALIDATORS: readonly AttendanceValidator[] = [
  validateStructure,
  validateClinicalCompleteness,
];

export function runValidators(
  input: AttendanceSessionInput,
  validators: readonly AttendanceValidator[] = DEFAULT_VALIDATORS,
): AttendanceValidationResult {
  const issues = validators.flatMap((validator) => validator(input));
  return {
    valid: issues.every((issue) => issue.severity !== "error"),
    issues,
  };
}

/** Valida a sessão e lança na primeira violação bloqueante. */
export function assertValidSession(
  input: AttendanceSessionInput,
  validators?: readonly AttendanceValidator[],
): void {
  const { issues } = runValidators(input, validators);
  const blocking = issues.find((issue) => issue.severity === "error");
  if (blocking) throw new Error(blocking.message);
}

/** Uma sessão encerrada não aceita novas evoluções. */
export function assertSessionOpen(status: AttendanceStatus): void {
  if (!isEditable(status)) {
    throw new Error(
      status === ATTENDANCE_STATUS.CANCELADO
        ? "Atendimento cancelado não pode receber novas evoluções."
        : "Atendimento concluído não pode receber novas evoluções.",
    );
  }
}
