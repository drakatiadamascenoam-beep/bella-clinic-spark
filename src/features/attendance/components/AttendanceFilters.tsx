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
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_VALUES,
} from "../domain/attendance-status";
import type { AttendanceStatusFilter } from "../types/attendance.types";

export interface AttendanceFiltersValue {
  search: string;
  status: AttendanceStatusFilter;
}

export interface AttendanceFiltersProps {
  value: AttendanceFiltersValue;
  disabled?: boolean;
  onChange: (value: AttendanceFiltersValue) => void;
}

/** Busca única (paciente ou protocolo) + filtro por status. */
export function AttendanceFilters({
  value,
  disabled = false,
  onChange,
}: AttendanceFiltersProps) {
  const hasFilters = value.search.length > 0 || value.status !== "all";

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
          placeholder="Buscar por paciente ou protocolo"
          aria-label="Pesquisa rápida de atendimentos"
          className="pl-9 focus-visible:ring-2 focus-visible:ring-marsala"
        />
      </div>

      <Select
        value={value.status}
        disabled={disabled}
        onValueChange={(next) =>
          onChange({ ...value, status: next as AttendanceStatusFilter })
        }
      >
        <SelectTrigger
          aria-label="Filtrar por status"
          className="w-full focus-visible:ring-2 focus-visible:ring-marsala sm:w-56"
        >
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Todos os status</SelectItem>
          {ATTENDANCE_STATUS_VALUES.map((status) => (
            <SelectItem key={status} value={status}>
              {ATTENDANCE_STATUS_LABELS[status]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          type="button"
          variant="ghost"
          onClick={() => onChange({ search: "", status: "all" })}
          className="shrink-0 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <X className="mr-2 h-4 w-4" aria-hidden="true" />
          Limpar
        </Button>
      )}
    </div>
  );
}
