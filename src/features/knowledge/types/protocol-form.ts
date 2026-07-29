import { z } from "zod";

/**
 * Fonte única de validação do formulário de Protocolos Mestres.
 * Consumida pelo React Hook Form (cliente) e pelo protocol.service (servidor).
 */

export const PROTOCOL_FORM_STATUS = ["active", "draft", "archived"] as const;

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres.`)
    .optional()
    .transform((value) => value ?? "");

export const protocolFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe ao menos 3 caracteres.")
    .max(160, "Máximo de 160 caracteres."),
  code: optionalText(40),
  category: optionalText(80),
  version: optionalText(20),
  status: z.enum(PROTOCOL_FORM_STATUS, {
    message: "Selecione um status válido.",
  }),
  summary: optionalText(600),
  indications: optionalText(2000),
  contraindications: optionalText(2000),
});

export type ProtocolFormValues = z.infer<typeof protocolFormSchema>;

export const PROTOCOL_FORM_DEFAULTS: ProtocolFormValues = {
  name: "",
  code: "",
  category: "",
  version: "",
  status: "draft",
  summary: "",
  indications: "",
  contraindications: "",
};
