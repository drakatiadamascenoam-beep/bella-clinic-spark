import { useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { usePacientes } from "../hooks/usePatient";
import { PATIENT_PAGE_SIZE } from "../services/patient.mapper";
import type { Patient, PatientSortDirection, PatientSortField } from "../types/patient.types";
import { PatientFilters, type PatientFiltersValue } from "../components/PatientFilters";
import { PatientTable } from "../components/PatientTable";
import { PatientDetailSheet } from "../components/PatientDetailSheet";
import { PatientFormSheet } from "../components/PatientFormSheet";

const INITIAL_FILTERS: PatientFiltersValue = { search: "" };

export function PacientesPage() {
  const [filters, setFilters] = useState<PatientFiltersValue>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<PatientSortField>("nome");
  const [sortDir, setSortDir] = useState<PatientSortDirection>("asc");
  const [selected, setSelected] = useState<Patient | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Patient | null>(null);

  const query = useMemo(
    () => ({ search: filters.search, sortBy, sortDir, page }),
    [filters.search, sortBy, sortDir, page],
  );
  const { data, isPending, isError, refetch, isFetching } = usePacientes(query);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PATIENT_PAGE_SIZE));

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(patient: Patient) {
    setSelected(null);
    setEditing(patient);
    setFormOpen(true);
  }

  function handleFiltersChange(next: PatientFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  function handleSortChange(field: PatientSortField) {
    if (field === sortBy) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setSortDir(field === "created_at" ? "desc" : "asc");
    }
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Gestão de Pacientes</h1>
          <p className="mt-1 text-muted-foreground">
            Cadastro, consulta e Raio-X de prontuário da clínica Esthetic Center.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo paciente
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
                Não foi possível carregar os pacientes
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

      <PatientFilters value={filters} disabled={isPending} onChange={handleFiltersChange} />

      <PatientTable
        patients={data?.items ?? []}
        isLoading={isPending}
        sourceUnavailable={data?.sourceUnavailable ?? false}
        sortBy={sortBy}
        sortDir={sortDir}
        onSortChange={handleSortChange}
        onSelect={setSelected}
        onEdit={openEdit}
      />

      {total > 0 && (
        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} · {total}{" "}
            {total === 1 ? "paciente cadastrado" : "pacientes cadastrados"}
          </p>
          {total > PATIENT_PAGE_SIZE && (
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

      <PatientDetailSheet
        patient={selected}
        open={selected !== null}
        onEdit={openEdit}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />

      <PatientFormSheet
        patient={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
