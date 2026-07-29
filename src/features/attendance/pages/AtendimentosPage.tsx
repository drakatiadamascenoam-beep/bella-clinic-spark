import { useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAtendimentos } from "../hooks/useAttendance";
import { ATTENDANCE_PAGE_SIZE } from "../mappers/attendance.mapper";
import type { Attendance } from "../types/attendance.types";
import {
  AttendanceFilters,
  type AttendanceFiltersValue,
} from "../components/AttendanceFilters";
import { AttendanceTable } from "../components/AttendanceTable";
import { AttendanceDetailSheet } from "../components/AttendanceDetailSheet";
import { AttendanceFormSheet } from "../components/AttendanceFormSheet";

const INITIAL_FILTERS: AttendanceFiltersValue = { search: "", status: "all" };

export function AtendimentosPage() {
  const [filters, setFilters] = useState<AttendanceFiltersValue>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Attendance | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Attendance | null>(null);

  const query = useMemo(
    () => ({ search: filters.search, status: filters.status, page }),
    [filters.search, filters.status, page],
  );
  const { data, isPending, isError, refetch, isFetching } = useAtendimentos(query);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ATTENDANCE_PAGE_SIZE));

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(attendance: Attendance) {
    setSelected(null);
    setEditing(attendance);
    setFormOpen(true);
  }

  function handleFiltersChange(next: AttendanceFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Atendimento Clínico</h1>
          <p className="mt-1 text-muted-foreground">
            Sessões, evolução de prontuário e protocolos aplicados na clínica Esthetic Center.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo atendimento
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
                Não foi possível carregar os atendimentos
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

      <AttendanceFilters value={filters} disabled={isPending} onChange={handleFiltersChange} />

      <AttendanceTable
        attendances={data?.items ?? []}
        isLoading={isPending}
        sourceUnavailable={data?.sourceUnavailable ?? false}
        onSelect={setSelected}
        onEdit={openEdit}
      />

      {total > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} · {total}{" "}
            {total === 1 ? "atendimento registrado" : "atendimentos registrados"}
          </p>
          {total > ATTENDANCE_PAGE_SIZE && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <ChevronLeft className="mr-1 h-4 w-4" aria-hidden="true" />
                Anterior
              </Button>
              <Button
                variant="outline"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                Próxima
                <ChevronRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          )}
        </div>
      )}

      <AttendanceDetailSheet
        attendance={selected}
        open={selected !== null}
        onEdit={openEdit}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />

      <AttendanceFormSheet
        attendance={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
