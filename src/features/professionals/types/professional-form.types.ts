import { z } from "zod";
import { CONSELHO_PROFISSIONAL_VALUES } from "../domain/professional-role";
import { PROFESSIONAL_ROLE_VALUES, requiresRegistration, toProfessionalRole } from "../domain/professional-role";
import { registrationErrorMessage } from "../domain/professional-registration";
import { validateWorkSchedule, WEEKDAY_VALUES } from "../domain/professional-schedule-rules";

/**
 * Fonte ÚNICA de validação do formulário de Profissionais.
 * Consumida pelo React Hook Form (cliente) e pelo professional.service (servidor).
 */

const optionalText = (max: number) =>
  z.string().trim().max(max, `Máximo de ${max} caracteres.`);

const timeSchema = z
  .string()
  .trim()
  .regex(/^\d{2}:\d{2}$/, "Informe um horário no formato HH:mm.");

const optionalTimeSchema = z
  .string()
  .trim()
  .refine((value) => value.length === 0 || /^\d{2}:\d{2}$/.test(value), "Informe um horário no formato HH:mm.");

const emailSchema = optionalText(160).refine(
  (value) => value.length === 0 || z.string().email().safeParse(value).success,
  "Informe um e-mail válido.",
);

export const professionalSchema = z
  .object({
    nome: z.string().trim().min(3, "Informe ao menos 3 caracteres.").max(160, "Máximo de 160 caracteres."),
    papel_clinico: z.enum(PROFESSIONAL_ROLE_VALUES as [string, ...string[]], {
      message: "Selecione o papel do profissional.",
    }),
    conselho_profissional: z
      .enum(CONSELHO_PROFISSIONAL_VALUES as [string, ...string[]])
      .optional()
      .or(z.literal("")),
    registro_profissional: optionalText(20),
    especialidade: optionalText(160),
    email: emailSchema,
    telefone: optionalText(20),
    dias_atendimento: z.array(z.enum(WEEKDAY_VALUES as [string, ...string[]])),
    horario_inicio: timeSchema,
    horario_fim: timeSchema,
    intervalo_inicio: optionalTimeSchema,
    intervalo_fim: optionalTimeSchema,
    ativo: z.boolean(),
  })
  .superRefine((values, ctx) => {
    const scheduleValidation = validateWorkSchedule({
      diasAtendimento: values.dias_atendimento,
      horarioInicio: values.horario_inicio,
      horarioFim: values.horario_fim,
      intervaloInicio: values.intervalo_inicio || null,
      intervaloFim: values.intervalo_fim || null,
    });

    if (!scheduleValidation.valid) {
      const [firstError] = scheduleValidation.errors;
      ctx.addIssue({ code: "custom", path: ["dias_atendimento"], message: firstError });
    }

    const papel = toProfessionalRole(values.papel_clinico);
    if (requiresRegistration(papel)) {
      const error = registrationErrorMessage(values.registro_profissional);
      if (error) {
        ctx.addIssue({ code: "custom", path: ["registro_profissional"], message: error });
      }
      if (!values.conselho_profissional) {
        ctx.addIssue({
          code: "custom",
          path: ["conselho_profissional"],
          message: "Selecione o conselho profissional.",
        });
      }
    }
  });

export type ProfessionalFormData = z.infer<typeof professionalSchema>;

export function professionalFormDefaults(): ProfessionalFormData {
  return {
    nome: "",
    papel_clinico: "",
    conselho_profissional: "",
    registro_profissional: "",
    especialidade: "",
    email: "",
    telefone: "",
    dias_atendimento: [],
    horario_inicio: "09:00",
    horario_fim: "18:00",
    intervalo_inicio: "",
    intervalo_fim: "",
    ativo: true,
  };
}
