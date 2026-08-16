import { RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DASHBOARD_PERIOD_LABELS, type DashboardPeriod } from "../types/dashboard.types";

const SELECTABLE: DashboardPeriod[] = ["today", "week", "month", "last30", "last90", "year"];

export interface DashboardFiltersProps {
  period: DashboardPeriod;
  rangeLabel: string | null;
  isRefreshing?: boolean;
  onPeriodChange: (period: DashboardPeriod) => void;
  onRefresh: () => void;
}

export function DashboardFilters({
  period,
  rangeLabel,
  isRefreshing = false,
  onPeriodChange,
  onRefresh,
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div
        className="flex flex-wrap gap-1 rounded-xl border border-border/60 bg-card p-1"
        role="group"
        aria-label="Período de análise"
      >
        {SELECTABLE.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={period === option}
            onClick={() => onPeriodChange(option)}
            className={cn(
              "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala focus-visible:ring-offset-2",
              period === option
                ? "bg-marsala text-marsala-foreground"
                : "text-muted-foreground hover:bg-muted",
            )}
          >
            {DASHBOARD_PERIOD_LABELS[option]}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-3">
        {rangeLabel && <span className="text-xs text-muted-foreground">{rangeLabel}</span>}
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="rounded-lg focus-visible:ring-marsala"
          aria-label="Atualizar indicadores"
        >
          <RefreshCcw
            className={cn("mr-2 h-3.5 w-3.5", isRefreshing && "animate-spin")}
            aria-hidden="true"
          />
          Atualizar
        </Button>
      </div>
    </div>
  );
}
