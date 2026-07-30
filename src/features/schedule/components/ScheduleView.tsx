import { useMemo, useState } from "react";
import { CalendarClock, LayoutList, Rows3 } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Appointment } from "../types/schedule.types";
import { ScheduleStatusBadge } from "./ScheduleStatusBadge";
import { formatDuration, formatSlotRange, formatTime, truncate } from "./schedule-format";

type ViewMode = "list" | "timeline";

export interface ScheduleViewProps {
  appointments: Appointment[];
  isLoading?: boolean;
  sourceUnavailable?: boolean;
  onSelect: (appointment: Appointment) => void;
}

function EmptyState({ sourceUnavailable }: { sourceUnavailable: boolean }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <CalendarClock className="h-5 w-5" aria-hidden="true" />
      </span>
      <p className="font-medium text-foreground">
        {sourceUnavailable
          ? "Fonte de dados indisponível (Aguardando BKG v3.0)"
          : "Nenhum compromisso para este dia"}
      </p>
      <p className="max-w-md text-sm text-muted-foreground">
        {sourceUnavailable
          ? "A base de Agendamentos do Bella Knowledge Graph v3.0 ainda não está publicada nesta instância. Os compromissos aparecerão automaticamente assim que a fonte estiver disponível."
          : "Selecione outra data, ajuste o filtro de status ou crie um novo agendamento."}
      </p>
    </div>
  );
}

/** Visualização desacoplada da Agenda: Lista/Tabela do dia ou Timeline. */
export function ScheduleView({
  appointments,
  isLoading = false,
  sourceUnavailable = false,
  onSelect,
}: ScheduleViewProps) {
  const [mode, setMode] = useState<ViewMode>("list");

  const timeline = useMemo(() => {
    const groups = new Map<string, Appointment[]>();
    for (const appointment of appointments) {
      const hour = appointment.dataHoraInicio
        ? `${formatTime(appointment.dataHoraInicio).slice(0, 2)}h`
        : "Sem horário";
      const bucket = groups.get(hour) ?? [];
      bucket.push(appointment);
      groups.set(hour, bucket);
    }
    return Array.from(groups.entries());
  }, [appointments]);

  const isEmpty = !isLoading && appointments.length === 0;

  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h2 className="text-sm font-medium text-muted-foreground">Compromissos do dia</h2>
        <div className="flex gap-1" role="group" aria-label="Modo de visualização">
          <Button
            type="button"
            size="sm"
            variant={mode === "list" ? "default" : "ghost"}
            onClick={() => setMode("list")}
            className="focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <Rows3 className="mr-2 h-4 w-4" aria-hidden="true" />
            Lista
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "timeline" ? "default" : "ghost"}
            onClick={() => setMode("timeline")}
            className="focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <LayoutList className="mr-2 h-4 w-4" aria-hidden="true" />
            Timeline
          </Button>
        </div>
      </header>

      {isLoading && (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={`schedule-skeleton-${index}`} className="h-12 w-full rounded-xl" />
          ))}
        </div>
      )}

      {isEmpty && <EmptyState sourceUnavailable={sourceUnavailable} />}

      {!isLoading && appointments.length > 0 && mode === "list" && (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[24%]">Horário</TableHead>
              <TableHead className="w-[28%]">Paciente</TableHead>
              <TableHead className="hidden md:table-cell">Protocolo</TableHead>
              <TableHead className="hidden sm:table-cell">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {appointments.map((appointment) => (
              <TableRow
                key={appointment.id}
                tabIndex={0}
                role="button"
                aria-label={`Abrir compromisso de ${appointment.pacienteNome ?? "paciente"}`}
                onClick={() => onSelect(appointment)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(appointment);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <TableCell className="text-muted-foreground">
                  {formatSlotRange(appointment.dataHoraInicio, appointment.duracaoMinutos)}
                  <span className="ml-2 text-xs">
                    ({formatDuration(appointment.duracaoMinutos)})
                  </span>
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {appointment.pacienteNome ?? "Paciente não identificado"}
                  </p>
                  <div className="sm:hidden">
                    <ScheduleStatusBadge status={appointment.status} className="mt-1" />
                  </div>
                </TableCell>
                <TableCell className="hidden text-muted-foreground md:table-cell">
                  {appointment.protocoloNome ?? "Sem protocolo vinculado"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <ScheduleStatusBadge status={appointment.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!isLoading && appointments.length > 0 && mode === "timeline" && (
        <ol className="divide-y divide-border">
          {timeline.map(([hour, items]) => (
            <li key={hour} className="flex gap-4 px-4 py-4">
              <span className="w-14 shrink-0 pt-1 font-serif text-lg text-marsala">{hour}</span>
              <div className="flex flex-1 flex-col gap-2">
                {items.map((appointment) => (
                  <button
                    key={appointment.id}
                    type="button"
                    onClick={() => onSelect(appointment)}
                    className={cn(
                      "flex flex-col gap-1 rounded-xl border border-border bg-background p-3 text-left transition-colors",
                      "hover:border-marsala/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala",
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-medium text-foreground">
                        {appointment.pacienteNome ?? "Paciente não identificado"}
                      </span>
                      <ScheduleStatusBadge status={appointment.status} />
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatSlotRange(appointment.dataHoraInicio, appointment.duracaoMinutos)} ·{" "}
                      {appointment.protocoloNome ?? "Sem protocolo vinculado"}
                    </span>
                    {appointment.observacoes && (
                      <span className="text-sm text-muted-foreground">
                        {truncate(appointment.observacoes, 90)}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
