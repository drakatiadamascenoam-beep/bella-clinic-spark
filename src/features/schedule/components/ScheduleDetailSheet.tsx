import { useState } from "react";
import { CalendarClock, Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useUpdateAgendamentoStatus } from "../hooks/useSchedule";
import {
  scheduleAllowsAttendance,
  scheduleIsTerminal,
  scheduleTransitionsFor,
} from "../types/schedule-view";
import type { Appointment, ScheduleAttendanceContext } from "../types/schedule.types";
import { ScheduleStatusBadge } from "./ScheduleStatusBadge";
import { formatDateTime, formatDuration, formatSlotRange } from "./schedule-format";

export interface ScheduleDetailSheetProps {
  appointment: Appointment | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Encaminha o contexto ao Atendimento Clínico — nunca cria registros. */
  onStartAttendance: (context: ScheduleAttendanceContext) => void;
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm text-foreground">{value}</p>
    </div>
  );
}

export function ScheduleDetailSheet({
  appointment,
  open,
  onOpenChange,
  onStartAttendance,
}: ScheduleDetailSheetProps) {
  const statusMutation = useUpdateAgendamentoStatus();
  const [pending, setPending] = useState<string | null>(null);

  if (!appointment) {
    return (
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="sm:max-w-lg" />
      </Sheet>
    );
  }

  const transitions = scheduleTransitionsFor(appointment.status);

  async function handleTransition(target: string, label: string, sensitive: boolean) {
    if (!appointment) return;
    if (sensitive) {
      const confirmed = window.confirm(`Confirmar a ação "${label}"?`);
      if (!confirmed) return;
    }
    setPending(target);
    try {
      await statusMutation.mutateAsync({
        id: appointment.id,
        status: target as Appointment["status"],
      });
      toast.success(`${label} concluído.`);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível alterar o status do compromisso.",
      );
    } finally {
      setPending(null);
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {appointment.pacienteNome ?? "Paciente não identificado"}
          </SheetTitle>
          <SheetDescription className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4" aria-hidden="true" />
            {formatSlotRange(appointment.dataHoraInicio, appointment.duracaoMinutos)} ·{" "}
            {formatDuration(appointment.duracaoMinutos)}
          </SheetDescription>
          <ScheduleStatusBadge status={appointment.status} className="w-fit" />
        </SheetHeader>

        <Separator className="my-4" />

        <div className="grid gap-3">
          <Field
            label="Protocolo mestre"
            value={appointment.protocoloNome ?? "Sem protocolo vinculado"}
          />
          <Field
            label="Profissional"
            value={appointment.profissionalNome ?? "Não atribuído"}
          />
          <Field label="Início" value={formatDateTime(appointment.dataHoraInicio)} />
          <Field label="Observações" value={appointment.observacoes ?? "—"} />
        </div>

        <Separator className="my-4" />

        <div className="flex flex-col gap-2">
          <p className="text-sm font-medium text-foreground">Ciclo de vida do compromisso</p>
          {scheduleIsTerminal(appointment.status) ? (
            <p className="text-sm text-muted-foreground">
              Este compromisso está em um estado final e não aceita novas transições.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {transitions.map((transition) => (
                <Button
                  key={transition.target}
                  type="button"
                  variant={transition.sensitive ? "outline" : "default"}
                  disabled={statusMutation.isPending}
                  onClick={() =>
                    void handleTransition(
                      transition.target,
                      transition.label,
                      transition.sensitive,
                    )
                  }
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  {pending === transition.target && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {transition.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <SheetFooter className="mt-auto flex-col gap-2 pt-6 sm:flex-col">
          <p className="text-xs text-muted-foreground">
            "Iniciar atendimento" apenas encaminha o contexto para o formulário clínico. Nenhum
            registro é criado sem a sua confirmação explícita.
          </p>
          <Button
            type="button"
            disabled={!scheduleAllowsAttendance(appointment.status)}
            onClick={() =>
              onStartAttendance({
                pacienteId: appointment.pacienteId,
                protocoloId: appointment.protocoloId,
                dataAtendimento: appointment.dataHoraInicio,
              })
            }
            className="w-full focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <Stethoscope className="mr-2 h-4 w-4" aria-hidden="true" />
            Iniciar atendimento
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
