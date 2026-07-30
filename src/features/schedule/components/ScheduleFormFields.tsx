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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { scheduleDurationPresets } from "../types/schedule-view";
import type { ScheduleFormData } from "../types/schedule-form.types";
import { ScheduleSelectors } from "./ScheduleSelectors";
import { formatDuration } from "./schedule-format";

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-marsala";

export interface ScheduleFormFieldsProps {
  control: Control<ScheduleFormData>;
  disabled?: boolean;
  /** Destaca visualmente o horário quando há choque de agenda. */
  hasConflict?: boolean;
}

/** Campos do formulário de Agendamento — apresentação pura, sem acesso a dados. */
export function ScheduleFormFields({
  control,
  disabled = false,
  hasConflict = false,
}: ScheduleFormFieldsProps) {
  return (
    <>
      <ScheduleSelectors control={control} disabled={disabled} />

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          control={control}
          name="data_hora_inicio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data e hora de início</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="datetime-local"
                  disabled={disabled}
                  aria-invalid={hasConflict}
                  className={cn(
                    FOCUS_RING,
                    hasConflict && "border-destructive ring-1 ring-destructive/40",
                  )}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="duracao_minutos"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Duração</FormLabel>
              <Select
                value={String(field.value)}
                disabled={disabled}
                onValueChange={(next) => field.onChange(Number(next))}
              >
                <FormControl>
                  <SelectTrigger
                    aria-invalid={hasConflict}
                    className={cn(
                      FOCUS_RING,
                      hasConflict && "border-destructive ring-1 ring-destructive/40",
                    )}
                  >
                    <SelectValue placeholder="Selecione a duração" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {scheduleDurationPresets.map((minutes) => (
                    <SelectItem key={minutes} value={String(minutes)}>
                      {formatDuration(minutes)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>Bloqueio reservado na agenda da clínica.</FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <FormField
        control={control}
        name="observacoes"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Observações</FormLabel>
            <FormControl>
              <Textarea
                {...field}
                rows={4}
                disabled={disabled}
                placeholder="Preparo prévio, preferências do paciente e recados da recepção"
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
