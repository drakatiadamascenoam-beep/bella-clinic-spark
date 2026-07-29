import { useMemo, useState } from "react";
import { AlertCircle, ChevronLeft, ChevronRight, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useProtocols } from "@/hooks/useProtocol";
import { PROTOCOL_PAGE_SIZE, type Protocol } from "@/services/protocol.service";
import { ProtocolFilters, type ProtocolFiltersValue } from "../components/ProtocolFilters";
import { ProtocolTable } from "../components/ProtocolTable";
import { ProtocolDetailSheet } from "../components/ProtocolDetailSheet";
import { ProtocolFormSheet } from "../components/ProtocolFormSheet";

const INITIAL_FILTERS: ProtocolFiltersValue = {
  search: "",
  status: "all",
  category: "all",
};

export function ProtocolosPage() {
  const [filters, setFilters] = useState<ProtocolFiltersValue>(INITIAL_FILTERS);
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Protocol | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Protocol | null>(null);

  const query = useMemo(() => ({ ...filters, page }), [filters, page]);
  const { data, isPending, isError } = useProtocols(query);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PROTOCOL_PAGE_SIZE));

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }

  function openEdit(protocol: Protocol) {
    setSelected(null);
    setEditing(protocol);
    setFormOpen(true);
  }

  function handleFiltersChange(next: ProtocolFiltersValue) {
    setFilters(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Protocolos Mestres</h1>
          <p className="mt-1 text-muted-foreground">
            Protocolos clínicos padronizados da clínica Esthetic Center.
          </p>
        </div>
        <Button
          type="button"
          onClick={openCreate}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
          Novo protocolo
        </Button>
      </header>

      {isError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar os protocolos
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente em alguns instantes.
            </p>
          </div>
        </div>
      )}

      <ProtocolFilters
        value={filters}
        categories={data?.categories ?? []}
        disabled={isPending}
        onChange={handleFiltersChange}
      />

      <ProtocolTable
        protocols={data?.items ?? []}
        isLoading={isPending}
        sourceUnavailable={data?.sourceUnavailable ?? false}
        onSelect={setSelected}
        onEdit={openEdit}
      />

      {total > PROTOCOL_PAGE_SIZE && (
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages} · {total} protocolos
          </p>
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
        </div>
      )}

      <ProtocolDetailSheet
        protocol={selected}
        open={selected !== null}
        onEdit={openEdit}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      />

      <ProtocolFormSheet
        protocol={editing}
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditing(null);
        }}
      />
    </div>
  );
}
