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
import type { ProtocolStatus } from "@/services/protocol.service";
import { PROTOCOL_FORM_STATUS, PROTOCOL_STATUS_LABELS } from "../types/protocol-form";

export interface ProtocolFiltersValue {
  search: string;
  status: ProtocolStatus | "all";
  category: string | "all";
}

export interface ProtocolFiltersProps {
  value: ProtocolFiltersValue;
  categories: string[];
  disabled?: boolean;
  onChange: (value: ProtocolFiltersValue) => void;
}

const STATUS_OPTIONS: Array<{ value: ProtocolStatus | "all"; label: string }> = [
  { value: "all", label: "Todos os status" },
  ...PROTOCOL_FORM_STATUS.map((status) => ({
    value: status satisfies ProtocolStatus,
    label: PROTOCOL_STATUS_LABELS[status],
  })),
];

export function ProtocolFilters({
  value,
  categories,
  disabled = false,
  onChange,
}: ProtocolFiltersProps) {
  const hasFilters =
    value.search.length > 0 || value.status !== "all" || value.category !== "all";

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
          onChange={(event) => onChange({ ...value, search: event.target.value })}
          placeholder="Buscar por nome ou código"
          aria-label="Buscar protocolos"
          className="pl-9 focus-visible:ring-2 focus-visible:ring-marsala"
        />
      </div>

      <Select
        value={value.status}
        disabled={disabled}
        onValueChange={(next) => onChange({ ...value, status: next as ProtocolStatus | "all" })}
      >
        <SelectTrigger
          aria-label="Filtrar por status"
          className="w-full focus-visible:ring-2 focus-visible:ring-marsala sm:w-48"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={value.category}
        disabled={disabled || categories.length === 0}
        onValueChange={(next) => onChange({ ...value, category: next })}
      >
        <SelectTrigger
          aria-label="Filtrar por categoria"
          className="w-full focus-visible:ring-2 focus-visible:ring-marsala sm:w-52"
        >
          <SelectValue placeholder="Categoria" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todas as categorias</SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange({ search: "", status: "all", category: "all" })}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar
        </Button>
      )}
    </div>
  );
}
