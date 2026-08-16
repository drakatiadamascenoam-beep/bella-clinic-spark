import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WidgetShell } from "./WidgetShell";
import type { ChartPointModel } from "../types/dashboard.types";

export interface ScheduleOccupancyChartProps {
  points: ChartPointModel[];
  isLoading?: boolean;
  isError?: boolean;
  available?: boolean;
  onRetry?: () => void;
}

export function ScheduleOccupancyChart({
  points,
  isLoading,
  isError,
  available = true,
  onRetry,
}: ScheduleOccupancyChartProps) {
  return (
    <WidgetShell
      title="Ocupação da agenda"
      description="Distribuição dos compromissos por horário"
      isLoading={isLoading}
      isError={isError}
      available={available}
      isEmpty={points.length === 0}
      emptyMessage="Nenhum compromisso agendado no período selecionado."
      onRetry={onRetry}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="hsl(var(--muted-foreground))"
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              allowDecimals={false}
              stroke="hsl(var(--muted-foreground))"
            />
            <Tooltip
              cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
              contentStyle={{
                borderRadius: 12,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card))",
                fontSize: 12,
              }}
              formatter={(value: number) => [`${value}`, "Compromissos"]}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="hsl(var(--marsala))" opacity={0.85} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}
