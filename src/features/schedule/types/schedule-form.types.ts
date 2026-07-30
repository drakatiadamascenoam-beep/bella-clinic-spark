import { z } from "zod";
import {
  DEFAULT_DURATION_MINUTES,
  MAX_DURATION_MINUTES,
  MIN_DURATION_MINUTES,
} from "../domain/schedule-conflict";

/**
 * Fonte ÚNICA de validação do formulário de Agendamento.
 * Consumida pelo React Hook Form (cliente) e pelo schedule.service (servidor).
 *
 * Campos opcionais usam string vazia como "ausência de valor"; o mapper
 * converte para NULL ao persistir.
 */

const optionalText = (max: number) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres.`);

export const scheduleSchema = z.object({
  paciente_id: z.string().trim().min(1, "Selecione o paciente do compromisso."),
  protocolo_id: optionalText(64),
  profissional_id: optionalText(64),
  data_hora_inicio: z
    .string()
    .trim()
    .min(1, "Informe a data e hora do compromisso.")
    .refine(
      (value) => !Number.isNaN(new Date(value).getTime()),
      "Informe uma data e hora válidas.",
    ),
  duracao_minutos: z
    .coerce
    .number()
    .int("A duração deve ser um número inteiro de minutos.")
    .min(MIN_DURATION_MINUTES, `Duração mínima de ${MIN_DURATION_MINUTES} minutos.`)
    .max(MAX_DURATION_MINUTES, `Duração máxima de ${MAX_DURATION_MINUTES} minutos.`),
  observacoes: optionalText(2000),
});

export type ScheduleFormData = z.infer<typeof scheduleSchema>;

/** Valor `datetime-local` correspondente ao instante informado. */
export function toDateTimeLocalValue(value: string | Date | null): string {
  const date = value === null ? new Date() : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

/** Próxima marca de meia hora — padrão comercial da clínica. */
function nextHalfHour(base: Date): Date {
  const date = new Date(base);
  date.setSeconds(0, 0);
  const minutes = date.getMinutes();
  date.setMinutes(minutes <= 30 ? 30 : 60);
  return date;
}

export function scheduleFormDefaults(startsAt?: Date | null): ScheduleFormData {
  return {
    paciente_id: "",
    protocolo_id: "",
    profissional_id: "",
    data_hora_inicio: toDateTimeLocalValue(nextHalfHour(startsAt ?? new Date())),
    duracao_minutos: DEFAULT_DURATION_MINUTES,
    observacoes: "",
  };
}
