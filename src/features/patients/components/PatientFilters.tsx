import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export interface PatientFiltersValue {
  search: string;
}

export interface PatientFiltersProps {
  value: PatientFiltersValue;
  disabled?: boolean;
  onChange: (value: PatientFiltersValue) => void;
}

/**
 * Pesquisa rápida unificada: nome, nome social, CPF, telefone e e-mail.
 * A combinação de colunas é resolvida no serviço, nunca na UI.
 */
export function PatientFilters({ value, disabled = false, onChange }: PatientFiltersProps) {
  const hasFilters = value.search.length > 0;

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft sm:flex-row sm:items-center">
      <div className="relative flex-1">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          value={value.search}
          disabled={disabled}
          onChange={(event) => onChange({ search: event.target.value })}
          placeholder="Buscar por nome, CPF, telefone ou e-mail"
          aria-label="Pesquisa rápida de pacientes"
          className="pl-9 focus-visible:ring-2 focus-visible:ring-marsala"
        />
      </div>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange({ search: "" })}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar
        </Button>
      )}
    </div>
  );
}
