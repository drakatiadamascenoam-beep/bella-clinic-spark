import * as React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useDashboardAnalytics,
  useDashboardInsights,
  useDashboardMetrics,
} from "../hooks/useDashboard";
import { DashboardFilters } from "../components/DashboardFilters";
import { MetricCard } from "../components/MetricCard";
import { AttendanceTrendChart } from "../components/AttendanceTrendChart";
import { ScheduleOccupancyChart } from "../components/ScheduleOccupancyChart";
import { ProtocolDistributionChart } from "../components/ProtocolDistributionChart";
import { ProfessionalPerformanceTable } from "../components/ProfessionalPerformanceTable";
import { DashboardInsightsWidget } from "../components/DashboardInsightsWidget";
import type { DashboardPeriod, MetricCardModel } from "../types/dashboard.types";

const PLACEHOLDER_CARDS: MetricCardModel[] = [
  "Taxa de ocupação",
  "Absenteísmo",
  "Atendimentos realizados",
  "Média por paciente",
  "Pacientes ativos",
  "Pacientes novos",
  "Agendamentos futuros",
  "Profissionais ativos",
].map((label, index) => ({
  id: `placeholder-${index}`,
  label,
  value: null,
  format: "number" as const,
  hint: "",
  trend: null,
  trendValue: null,
  trendDirection: "neutral" as const,
  available: false,
}));

export function DashboardPage() {
  const [period, setPeriod] = React.useState<DashboardPeriod>("month");
  const options = React.useMemo(() => ({ period }), [period]);

  const metricsQuery = useDashboardMetrics(options);
  const analyticsQuery = useDashboardAnalytics(options);
  const insightsQuery = useDashboardInsights(options);

  const isLoading = metricsQuery.isPending;
  const refetch = () => {
    void metricsQuery.refetch();
  };

  const cards = metricsQuery.metrics?.cards ?? PLACEHOLDER_CARDS;
  const analytics = analyticsQuery.analytics;
  const availability = analytics?.availability;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Cockpit Executivo &amp; Indicadores
        </h1>
        <p className="text-muted-foreground">
          Leitura consolidada da operação clínica da Esthetic Center.
        </p>
      </header>

      <DashboardFilters
        period={period}
        rangeLabel={metricsQuery.metrics?.period.label ?? null}
        isRefreshing={metricsQuery.isFetching}
        onPeriodChange={setPeriod}
        onRefresh={refetch}
      />

      {metricsQuery.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <p className="flex items-center gap-2 text-sm text-foreground">
            <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
            Não foi possível carregar os indicadores do período.
          </p>
          <Button variant="outline" size="sm" onClick={refetch} className="rounded-lg">
            <RefreshCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
            Tentar novamente
          </Button>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.id} card={card} isLoading={isLoading} />
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AttendanceTrendChart
            points={analytics?.attendanceTrend ?? []}
            isLoading={analyticsQuery.isPending}
            isError={analyticsQuery.isError}
            available={availability?.attendances ?? false}
            onRetry={refetch}
          />
        </div>
        <div className="lg:col-span-1">
          <DashboardInsightsWidget
            insights={insightsQuery.insights}
            isLoading={insightsQuery.isPending}
            isError={insightsQuery.isError}
            onRetry={refetch}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <ScheduleOccupancyChart
          points={analytics?.occupancyByHour ?? []}
          isLoading={analyticsQuery.isPending}
          isError={analyticsQuery.isError}
          available={availability?.schedule ?? false}
          onRetry={refetch}
        />
        <ProtocolDistributionChart
          slices={analytics?.protocolDistribution ?? []}
          isLoading={analyticsQuery.isPending}
          isError={analyticsQuery.isError}
          available={(availability?.attendances ?? false) || (availability?.protocols ?? false)}
          onRetry={refetch}
        />
      </div>

      <ProfessionalPerformanceTable
        rows={analytics?.professionalPerformance ?? []}
        isLoading={analyticsQuery.isPending}
        isError={analyticsQuery.isError}
        available={availability?.professionals ?? false}
        onRetry={refetch}
      />
    </div>
  );
}
