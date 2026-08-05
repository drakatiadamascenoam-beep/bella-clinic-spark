import { useMemo, useState } from "react";
import { AlertCircle, Plus, RefreshCw } from "lucide-react";

import { Button } from "@/components/ui/button";

import { useProfissionais } from "../hooks/useProfessional";
import { ProfessionalFilters } from "../components/ProfessionalFilters";
import { ProfessionalTable } from "../components/ProfessionalTable";
import { ProfessionalFormSheet } from "../components/ProfessionalFormSheet";
import { ProfessionalDetailSheet } from "../components/ProfessionalDetailSheet";
import type { Professional, ProfessionalFiltersInput } from "../types/professional.types";

export function ProfissionaisPage() {
  const [filters, setFilters] = useState<ProfessionalFiltersInput>({
    search: "",
    role: "all",
  });
  const [selected, setSelected] = useState<Professional | null>(null);
  const [editing, setEditing] = useState<Professional | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const query = useMemo(
    () => ({ search: filters.search, role: filters.role }),
    [filters.search, filters.role],
  );
  const { data, isPending, isError, isFetching, refetch } = useProfissionais(query);

  function handleEdit(professional: Professional) {
    setSelected(null);
    setEditing(professional);
    setFormOpen(true);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">
            Gestão de Equipe &amp; Profissionais
          </h1>
          <p className="mt-1 text-muted-foreground">
            Cadastro, conselhos profissionais, papéis clínicos e jornada de atendimento da clínica
            Esthetic Center.
          </p>
        </div>
        <Button
          type="button"
          onClick={() => {
            setEditing(null);
            setFormOpen(true);
          }}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo Profissional
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
                Não foi possível carregar os profissionais
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

      <ProfessionalFilters value={filters} disabled={isPending} onChange={setFilters} />

      <ProfessionalTable
        professionals={data?.items ?? []}
        isLoading={isPending}
        sourceUnavailable={data?.sourceUnavailable ?? false}
        onSelect={setSelected}
        onEdit={handleEdit}
      />

      <ProfessionalDetailSheet
        professional={selected}
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
        onEdit={handleEdit}
      />

      <ProfessionalFormSheet
        professional={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
