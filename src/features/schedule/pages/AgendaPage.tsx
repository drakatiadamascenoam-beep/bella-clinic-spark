import { useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { AttendanceFormSheet, type AttendancePrefill } from "@/features/attendance";

import { useAgendamentos } from "../hooks/useSchedule";
import { ScheduleFilters } from "../components/ScheduleFilters";
import { ScheduleView } from "../components/ScheduleView";
import { ScheduleFormSheet } from "../components/ScheduleFormSheet";
import { ScheduleDetailSheet } from "../components/ScheduleDetailSheet";
import type {
  Appointment,
  ScheduleAttendanceContext,
  ScheduleFiltersInput,
} from "../types/schedule.types";

function todayKey(): string {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export function AgendaPage() {
  const [filters, setFilters] = useState<ScheduleFiltersInput>({
    date: todayKey(),
    status: "all",
  });
  const [selected, setSelected] = useState<Appointment | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [prefill, setPrefill] = useState<AttendancePrefill | null>(null);
  const [attendanceOpen, setAttendanceOpen] = useState(false);

  const query = useMemo(
    () => ({ date: filters.date, status: filters.status }),
    [filters.date, filters.status],
  );
  const { data, isPending, isError, isFetching, refetch } = useAgendamentos(query);

  function handleStartAttendance(context: ScheduleAttendanceContext) {
    setPrefill({
      pacienteId: context.pacienteId,
      protocoloId: context.protocoloId,
      dataAtendimento: context.dataAtendimento,
    });
    setSelected(null);
    setAttendanceOpen(true);
    toast.info("Contexto encaminhado. Confirme os dados para abrir a sessão clínica.");
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Agenda Clínica</h1>
          <p className="mt-1 text-muted-foreground">
            Compromissos, confirmações e encaminhamento para o atendimento da clínica Esthetic
            Center.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setFormOpen(true)}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo agendamento
        </Button>
      </header>

      {isError && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Não foi possível carregar a agenda
              </p>
              <p className="text-sm text-muted-foreground">
                Verifique sua conexão e tente novamente em alguns instantes.
              </p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            disabled={isFetching}
            onClick={() => void refetch()}
            className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`}
              aria-hidden="true"
            />
            Tentar novamente
          </Button>
        </div>
      )}

      <ScheduleFilters value={filters} disabled={isPending} onChange={setFilters} />

      <ScheduleView
        appointments={data?.items ?? []}
        isLoading={isPending}
        sourceUnavailable={data?.sourceUnavailable ?? false}
        onSelect={setSelected}
      />

      <ScheduleDetailSheet
        appointment={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onStartAttendance={handleStartAttendance}
      />

      <ScheduleFormSheet
        open={formOpen}
        defaultDate={filters.date}
        onOpenChange={setFormOpen}
      />

      <AttendanceFormSheet
        attendance={null}
        prefill={prefill}
        open={attendanceOpen}
        onOpenChange={(open) => {
          setAttendanceOpen(open);
          if (!open) setPrefill(null);
        }}
      />
    </div>
  );
}
