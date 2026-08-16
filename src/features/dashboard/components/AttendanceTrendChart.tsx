import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { WidgetShell } from "./WidgetShell";
import type { ChartPointModel } from "../types/dashboard.types";

export interface AttendanceTrendChartProps {
  points: ChartPointModel[];
  isLoading?: boolean;
  isError?: boolean;
  available?: boolean;
  onRetry?: () => void;
}

export function AttendanceTrendChart({
  points,
  isLoading,
  isError,
  available = true,
  onRetry,
}: AttendanceTrendChartProps) {
  const isEmpty = points.every((point) => point.value === 0);

  return (
    <WidgetShell
      title="Tendência de atendimentos"
      description="Volume diário de sessões clínicas no período"
      isLoading={isLoading}
      isError={isError}
      available={available}
      isEmpty={isEmpty}
      emptyMessage="Nenhuma sessão registrada no período selecionado."
      onRetry={onRetry}
    >
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={points} margin={{ top: 8, right: 8, bottom: 0, left: -20 }}>
            <defs>
              <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--marsala)" stopOpacity={0.28} />
                <stop offset="100%" stopColor="var(--marsala)" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              fontSize={11}
              stroke="var(--muted-foreground)"
              minTickGap={16}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={11}
              allowDecimals={false}
              stroke="var(--muted-foreground)"
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid var(--border)",
                background: "var(--card)",
                fontSize: 12,
              }}
              labelStyle={{ color: "var(--muted-foreground)" }}
              formatter={(value: number) => [`${value}`, "Atendimentos"]}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="var(--marsala)"
              strokeWidth={2}
              fill="url(#trendFill)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </WidgetShell>
  );
}
