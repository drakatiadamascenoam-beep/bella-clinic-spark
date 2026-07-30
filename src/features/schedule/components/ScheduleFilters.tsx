import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  scheduleStatusLabels,
  scheduleStatusValues,
} from "../types/schedule-view";
import type { ScheduleFiltersInput, ScheduleStatusFilter } from "../types/schedule.types";
import { formatLongDate } from "./schedule-format";

function shiftDate(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

function todayKey(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export interface ScheduleFiltersProps {
  value: ScheduleFiltersInput;
  disabled?: boolean;
  onChange: (value: ScheduleFiltersInput) => void;
}

/** Navegação por data (Hoje, Amanhã, seletor) + filtro por status. */
export function ScheduleFilters({ value, disabled = false, onChange }: ScheduleFiltersProps) {
  const isToday = value.date === todayKey();
  const isTomorrow = value.date === todayKey(1);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Dia anterior"
            onClick={() => onChange({ ...value, date: shiftDate(value.date, -1) })}
            className="focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </Button>
          <div className="min-w-0">
            <p className="flex items-center gap-2 font-medium capitalize text-foreground">
              <CalendarDays className="h-4 w-4 text-marsala" aria-hidden="true" />
              {formatLongDate(value.date)}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            disabled={disabled}
            aria-label="Próximo dia"
            onClick={() => onChange({ ...value, date: shiftDate(value.date, 1) })}
            className="focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>

        <Select
          value={value.status}
          disabled={disabled}
          onValueChange={(next) =>
            onChange({ ...value, status: next as ScheduleStatusFilter })
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
            {scheduleStatusValues.map((status) => (
              <SelectItem key={status} value={status}>
                {scheduleStatusLabels[status]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant={isToday ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange({ ...value, date: todayKey() })}
          className="focus-visible:ring-2 focus-visible:ring-marsala"
        >
          Hoje
        </Button>
        <Button
          type="button"
          variant={isTomorrow ? "default" : "outline"}
          size="sm"
          disabled={disabled}
          onClick={() => onChange({ ...value, date: todayKey(1) })}
          className="focus-visible:ring-2 focus-visible:ring-marsala"
        >
          Amanhã
        </Button>
        <Input
          type="date"
          value={value.date}
          disabled={disabled}
          aria-label="Selecionar data da agenda"
          onChange={(event) => {
            if (event.target.value.length > 0) {
              onChange({ ...value, date: event.target.value });
            }
          }}
          className={cn("w-auto focus-visible:ring-2 focus-visible:ring-marsala")}
        />
      </div>
    </div>
  );
}
