import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { professionalRoleLabels, professionalRoleValues } from "../types/professional-view";
import type { ProfessionalFiltersInput } from "../types/professional.types";

export interface ProfessionalFiltersProps {
  value: ProfessionalFiltersInput;
  disabled?: boolean;
  onChange: (value: ProfessionalFiltersInput) => void;
}

/** Filtro rápido: busca por nome/registro e seleção de papel profissional. */
export function ProfessionalFilters({
  value,
  disabled = false,
  onChange,
}: ProfessionalFiltersProps) {
  const hasFilters = value.search.length > 0 || value.role !== "all";

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
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Buscar por nome ou registro profissional"
          aria-label="Pesquisa rápida de profissionais"
          className="pl-9 focus-visible:ring-2 focus-visible:ring-marsala"
        />
      </div>

      <Select
        value={value.role}
        onValueChange={(role) => onChange({ ...value, role: role as ProfessionalFiltersInput["role"] })}
      >
        <SelectTrigger className="w-full sm:w-64 focus-visible:ring-2 focus-visible:ring-marsala">
          <SelectValue placeholder="Papel profissional" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os papéis</SelectItem>
          {professionalRoleValues.map((role) => (
            <SelectItem key={role} value={role}>
              {professionalRoleLabels[role]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() => onChange({ search: "", role: "all" })}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar
        </Button>
      )}
    </div>
  );
}
