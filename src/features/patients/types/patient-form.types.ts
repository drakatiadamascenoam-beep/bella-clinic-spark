import { z } from "zod";

/**
 * Fonte ÚNICA de validação do formulário de Pacientes.
 * Consumida pelo React Hook Form (cliente) e pelo patient.service (servidor).
 *
 * Campos opcionais usam string vazia como "ausência de valor" — o serviço
 * converte para NULL ao persistir.
 */

export const PATIENT_SEXO_OPTIONS = [
  "",
  "feminino",
  "masculino",
  "outro",
  "nao_informado",
] as const;

export type PatientSexo = (typeof PATIENT_SEXO_OPTIONS)[number];

export const PATIENT_SEXO_LABELS: Record<Exclude<PatientSexo, "">, string> = {
  feminino: "Feminino",
  masculino: "Masculino",
  outro: "Outro",
  nao_informado: "Não informado",
};

const optionalText = (max: number) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres.`);

/** Aceita 000.000.000-00 ou 11 dígitos. Vazio = não informado. */
const cpfSchema = optionalText(14).refine(
  (value) => value.length === 0 || /^\d{11}$/.test(value.replace(/\D/g, "")),
  "Informe um CPF com 11 dígitos.",
);

/** ISO date (yyyy-mm-dd) vinda de <input type="date">. */
const birthDateSchema = z
  .string()
  .trim()
  .refine(
    (value) => value.length === 0 || /^\d{4}-\d{2}-\d{2}$/.test(value),
    "Informe uma data válida.",
  )
  .refine((value) => {
    if (value.length === 0) return true;
    const date = new Date(`${value}T00:00:00`);
    return !Number.isNaN(date.getTime()) && date <= new Date();
  }, "A data de nascimento não pode ser futura.");

const emailSchema = optionalText(160).refine(
  (value) => value.length === 0 || z.string().email().safeParse(value).success,
  "Informe um e-mail válido.",
);

export const patientSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(3, "Informe ao menos 3 caracteres.")
    .max(160, "Máximo de 160 caracteres."),
  nome_social: optionalText(160),
  cpf: cpfSchema,
  data_nascimento: birthDateSchema,
  telefone: optionalText(20),
  email: emailSchema,
  sexo: z.enum(PATIENT_SEXO_OPTIONS),
  observacoes_alergias: optionalText(2000),
});

export type PatientFormData = z.infer<typeof patientSchema>;

export const PATIENT_FORM_DEFAULTS: PatientFormData = {
  nome: "",
  nome_social: "",
  cpf: "",
  data_nascimento: "",
  telefone: "",
  email: "",
  sexo: "",
  observacoes_alergias: "",
};

/** Máscara progressiva de CPF para digitação. */
export function maskCpf(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d)/, "$1.$2.$3-$4");
}

/** Máscara progressiva de telefone brasileiro. */
export function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 10) {
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/^\((\d{2})\) (\d{4})(\d)/, "($1) $2-$3");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/^\((\d{2})\) (\d{5})(\d)/, "($1) $2-$3");
}
