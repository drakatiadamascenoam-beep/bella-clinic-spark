import type { Control } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { AttendanceFormData } from "../types/attendance-form.types";
import { AttendanceSelectors } from "./AttendanceSelectors";
import { ClinicalEvolutionEditor } from "./ClinicalEvolutionEditor";

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-marsala";

export interface AttendanceFormFieldsProps {
  control: Control<AttendanceFormData>;
  disabled?: boolean;
}

/** Campos do formulário de Atendimento — apresentação pura, sem acesso a dados. */
export function AttendanceFormFields({ control, disabled = false }: AttendanceFormFieldsProps) {
  return (
    <>
      <AttendanceSelectors control={control} disabled={disabled} />

      <FormField
        control={control}
        name="data_atendimento"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Data e hora do atendimento</FormLabel>
            <FormControl>
              <Input
                {...field}
                type="datetime-local"
                disabled={disabled}
                className={FOCUS_RING}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="queixa_principal"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Queixa principal</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={3}
                disabled={disabled}
                placeholder="Relato do paciente no início da sessão"
                className={FOCUS_RING}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="evolucao_clinica"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Evolução clínica</FormLabel>
            <FormControl>
              <ClinicalEvolutionEditor
                name={field.name}
                value={field.value}
                onChange={field.onChange}
                onBlur={field.onBlur}
                disabled={disabled}
                placeholder="Registre a conduta, os achados e a evolução da sessão"
                className={FOCUS_RING}
              />
            </FormControl>
            <FormDescription>
              Conteúdo estruturado do prontuário. Campo obrigatório.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="observacoes_prescricoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações e prescrições</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={4}
                disabled={disabled}
                placeholder="Cuidados domiciliares, prescrições e recomendações"
                className={FOCUS_RING}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
