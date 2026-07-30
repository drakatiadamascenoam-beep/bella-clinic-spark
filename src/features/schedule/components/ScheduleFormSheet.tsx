import { useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useAgendamentos, useCreateAgendamento } from "../hooks/useSchedule";
import { useScheduleConflict } from "../hooks/useScheduleConflict";
import {
  scheduleFormDefaults,
  scheduleSchema,
  type ScheduleFormData,
} from "../types/schedule-form.types";
import { ScheduleFormFields } from "./ScheduleFormFields";

export interface ScheduleFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Data inicialmente selecionada na agenda (YYYY-MM-DD). */
  defaultDate?: string;
}

function dateKeyOf(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function ScheduleFormSheet({
  open,
  onOpenChange,
  defaultDate,
}: ScheduleFormSheetProps) {
  const createMutation = useCreateAgendamento();
  const isSubmitting = createMutation.isPending;

  const form = useForm<ScheduleFormData>({
    resolver: zodResolver(scheduleSchema),
    defaultValues: scheduleFormDefaults(),
    mode: "onBlur",
  });

  const { reset, watch } = form;
  useEffect(() => {
    if (!open) return;
    const base = defaultDate ? new Date(`${defaultDate}T09:00:00`) : null;
    reset(scheduleFormDefaults(base));
  }, [open, defaultDate, reset]);

  const startsAtValue = watch("data_hora_inicio");
  const durationValue = watch("duracao_minutos");

  const dayKey = dateKeyOf(startsAtValue);
  const dayQuery = useAgendamentos({ date: dayKey.length > 0 ? dayKey : "", status: "all" });
  const dayAppointments = useMemo(() => dayQuery.data?.items ?? [], [dayQuery.data]);

  const candidate = useMemo(
    () => ({
      startsAt: startsAtValue,
      durationMinutes: Number(durationValue),
    }),
    [startsAtValue, durationValue],
  );
  const conflict = useScheduleConflict(candidate, dayAppointments);

  const isDirty = form.formState.isDirty;
  const isCheckingAgenda = dayQuery.isPending;

  async function onSubmit(values: ScheduleFormData) {
    if (isSubmitting) return;
    if (conflict.hasConflict) {
      toast.error(conflict.message ?? "Conflito de agenda identificado.");
      return;
    }
    try {
      await createMutation.mutateAsync(values);
      toast.success("Agendamento criado com sucesso.");
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível criar o agendamento.",
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && isSubmitting) return;
    if (!next && isDirty) {
      const confirmed = window.confirm(
        "Existem alterações não salvas. Deseja descartar as alterações?",
      );
      if (!confirmed) return;
    }
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">Novo agendamento</SheetTitle>
          <SheetDescription>
            Reserve um horário vinculando paciente, protocolo mestre e duração do bloqueio.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4">
            <ScheduleFormFields
              control={form.control}
              disabled={isSubmitting}
              hasConflict={conflict.hasConflict}
            />

            {isCheckingAgenda && <Skeleton className="h-12 w-full rounded-xl" />}

            {conflict.hasConflict && conflict.message && (
              <div
                role="alert"
                className="flex items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-3"
              >
                <AlertTriangle
                  className="mt-0.5 h-4 w-4 shrink-0 text-destructive"
                  aria-hidden="true"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">Conflito de agenda</p>
                  <p className="text-sm text-muted-foreground">{conflict.message}</p>
                </div>
              </div>
            )}

            <SheetFooter className="mt-auto flex-row justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                disabled={isSubmitting}
                onClick={() => handleOpenChange(false)}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting || conflict.hasConflict}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                {isSubmitting && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                )}
                Criar agendamento
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
