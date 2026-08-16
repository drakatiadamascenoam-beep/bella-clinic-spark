import { ArrowDownRight, ArrowRight, ArrowUpRight, Minus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import type { MetricCardModel } from "../types/dashboard.types";

/** Formatação de apresentação — não há cálculo de métrica nesta camada. */
function formatValue(card: MetricCardModel): string {
  if (card.value === null) return "—";
  if (card.format === "percent") return `${card.value.toLocaleString("pt-BR")}%`;
  if (card.format === "decimal") return card.value.toLocaleString("pt-BR", { minimumFractionDigits: 1 });
  return card.value.toLocaleString("pt-BR");
}

const trendIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  neutral: Minus,
} as const;

const trendTone = {
  up: "text-emerald-700",
  down: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

export interface MetricCardProps {
  card: MetricCardModel;
  isLoading?: boolean;
}

export function MetricCard({ card, isLoading = false }: MetricCardProps) {
  const TrendIcon = trendIcon[card.trendDirection];

  return (
    <Card className="border-border/60 bg-card shadow-soft">
      <CardContent className="flex flex-col gap-3 p-5">
        <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{card.label}</p>

        {isLoading ? (
          <Skeleton className="h-9 w-24" />
        ) : (
          <p className="font-serif text-3xl font-medium text-foreground">{formatValue(card)}</p>
        )}

        {isLoading ? (
          <Skeleton className="h-4 w-40" />
        ) : card.available ? (
          <div className="flex flex-col gap-1">
            <p className="text-xs text-muted-foreground">{card.hint}</p>
            {card.trend && (
              <p className={cn("flex items-center gap-1 text-xs font-medium", trendTone[card.trendDirection])}>
                <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
                {card.trend}
              </p>
            )}
          </div>
        ) : (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            Aguardando BKG v3.0 · dados em agregação
          </p>
        )}
      </CardContent>
    </Card>
  );
}
