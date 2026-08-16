import { WidgetShell } from "./WidgetShell";
import type { DistributionSliceModel } from "../types/dashboard.types";

export interface ProtocolDistributionChartProps {
  slices: DistributionSliceModel[];
  isLoading?: boolean;
  isError?: boolean;
  available?: boolean;
  onRetry?: () => void;
}

export function ProtocolDistributionChart({
  slices,
  isLoading,
  isError,
  available = true,
  onRetry,
}: ProtocolDistributionChartProps) {
  return (
    <WidgetShell
      title="Protocolos mais aplicados"
      description="Distribuição dos Protocolos Mestres no período"
      isLoading={isLoading}
      isError={isError}
      available={available}
      isEmpty={slices.length === 0}
      emptyMessage="Nenhum protocolo aplicado no período selecionado."
      onRetry={onRetry}
    >
      <ul className="flex flex-col gap-4">
        {slices.map((slice) => (
          <li key={slice.key} className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between gap-4">
              <span className="truncate text-sm text-foreground">{slice.label}</span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {slice.value} · {slice.share}%
              </span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-muted"
              role="img"
              aria-label={`${slice.label}: ${slice.share}% das aplicações`}
            >
              <div
                className="h-full rounded-full bg-marsala"
                style={{ width: `${Math.max(2, slice.share)}%` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </WidgetShell>
  );
}
