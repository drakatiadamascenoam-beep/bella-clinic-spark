import { useMemo } from "react";
import type { Control } from "react-hook-form";
import { AlertTriangle } from "lucide-react";

import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

import { usePacientes } from "@/features/patients/hooks/usePatient";
import { useProtocols } from "@/hooks/useProtocol";
import type { ScheduleFormData } from "../types/schedule-form.types";

const FOCUS_RING = "focus-visible:ring-2 focus-visible:ring-marsala";
const NO_PROTOCOL = "__none__";

interface Option {
  value: string;
  label: string;
}

function UnavailableHint({ message }: { message: string }) {
  return (
    <FormDescription className="flex items-start gap-2 text-muted-foreground">
      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
      {message}
    </FormDescription>
  );
}

export interface ScheduleSelectorsProps {
  control: Control<ScheduleFormData>;
  disabled?: boolean;
}

/**
 * Seletores de Paciente e Protocolo Mestre do Agendamento.
 * Reutiliza exclusivamente os hooks existentes (usePacientes / useProtocols)
 * e degrada de forma explicativa quando a fonte está indisponível.
 */
export function ScheduleSelectors({ control, disabled = false }: ScheduleSelectorsProps) {
  const patientsQuery = usePacientes({
    search: "",
    sortBy: "nome",
    sortDir: "asc",
    page: 1,
  });
  const protocolsQuery = useProtocols({
    search: "",
    status: "active",
    category: "all",
    page: 1,
  });

  const patientOptions = useMemo<Option[]>(
    () =>
      (patientsQuery.data?.items ?? []).map((patient) => ({
        value: patient.id,
        label: patient.nomeSocial ? `${patient.nome} (${patient.nomeSocial})` : patient.nome,
      })),
    [patientsQuery.data],
  );

  const protocolOptions = useMemo<Option[]>(
    () =>
      (protocolsQuery.data?.items ?? []).map((protocol) => ({
        value: protocol.id,
        label: protocol.code ? `${protocol.name} · ${protocol.code}` : protocol.name,
      })),
    [protocolsQuery.data],
  );

  const patientsUnavailable =
    patientsQuery.isError ||
    (patientsQuery.data?.sourceUnavailable ?? false) ||
    (!patientsQuery.isPending && patientOptions.length === 0);
  const protocolsUnavailable =
    protocolsQuery.isError ||
    (protocolsQuery.data?.sourceUnavailable ?? false) ||
    (!protocolsQuery.isPending && protocolOptions.length === 0);

  if (patientsQuery.isPending || protocolsQuery.isPending) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  return (
    <>
      <FormField
        control={control}
        name="paciente_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Paciente</FormLabel>
            <Select
              value={field.value.length > 0 ? field.value : undefined}
              disabled={disabled || patientsUnavailable}
              onValueChange={field.onChange}
            >
              <FormControl>
                <SelectTrigger className={FOCUS_RING}>
                  <SelectValue
                    placeholder={
                      patientsUnavailable ? "Fonte indisponível" : "Selecione o paciente"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {patientOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {patientsUnavailable && (
              <UnavailableHint message="Fonte de Pacientes indisponível (Aguardando BKG v3.0). O campo permanece desabilitado até a base ser publicada." />
            )}
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="protocolo_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Protocolo mestre (opcional)</FormLabel>
            <Select
              value={field.value.length > 0 ? field.value : NO_PROTOCOL}
              disabled={disabled || protocolsUnavailable}
              onValueChange={(next) => field.onChange(next === NO_PROTOCOL ? "" : next)}
            >
              <FormControl>
                <SelectTrigger className={FOCUS_RING}>
                  <SelectValue
                    placeholder={
                      protocolsUnavailable ? "Fonte indisponível" : "Sem protocolo vinculado"
                    }
                  />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={NO_PROTOCOL}>Sem protocolo vinculado</SelectItem>
                {protocolOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {protocolsUnavailable && (
              <UnavailableHint message="Fonte de Protocolos Mestres indisponível (Aguardando BKG v3.0). O compromisso pode ser criado sem vínculo de protocolo." />
            )}
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}
