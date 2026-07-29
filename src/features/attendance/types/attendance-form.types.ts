import { z } from "zod";
import {
  MAX_EVOLUTION_LENGTH,
  MIN_EVOLUTION_LENGTH,
} from "../domain/attendance-validation";

/**
 * Fonte ÚNICA de validação do formulário de Atendimento.
 * Consumida pelo React Hook Form (cliente) e pelo attendance.service (servidor).
 *
 * Campos opcionais usam string vazia como "ausência de valor"; o mapper
 * converte para NULL ao persistir.
 */

const optionalText = (max: number) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres.`);

export const attendanceSchema = z.object({
  paciente_id: z.string().trim().min(1, "Selecione o paciente da sessão."),
  protocolo_id: optionalText(64),
  data_atendimento: z
    .string()
    .trim()
    .min(1, "Informe a data do atendimento.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Informe uma data e hora válidas.",
    ),
  queixa_principal: optionalText(1000),
  evolucao_clinica: z
    .string()
    .trim()
    .min(MIN_EVOLUTION_LENGTH, `Descreva a evolução com ao menos ${MIN_EVOLUTION_LENGTH} caracteres.`)
    .max(MAX_EVOLUTION_LENGTH, `Máximo de ${MAX_EVOLUTION_LENGTH} caracteres.`),
  observacoes_prescricoes: optionalText(4000),
});

export type AttendanceFormData = z.infer<typeof attendanceSchema>;

/** Valor `datetime-local` correspondente ao instante informado. */
export function toDateTimeLocalValue(value: string | Date | null): string {
  const date = value === null ? new Date() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

export function attendanceFormDefaults(): AttendanceFormData {
  return {
    paciente_id: "",
    protocolo_id: "",
    data_atendimento: toDateTimeLocalValue(null),
    queixa_principal: "",
    evolucao_clinica: "",
    observacoes_prescricoes: "",
  };
}
