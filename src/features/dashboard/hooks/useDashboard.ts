import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { loadDashboardSnapshot } from "../services/dashboard.service";
import type { DashboardPeriod, DateRange } from "../domain/dashboard-filters";
import type {
  DashboardAnalyticsModel,
  DashboardInsight,
  DashboardMetricsModel,
  DashboardSnapshot,
} from "../types/dashboard.types";

/**
 * Única porta de entrada de dados do Cockpit Executivo.
 * UI → hooks → dashboard.service.ts → contratos públicos das Sprints 2–8.
 */

export interface DashboardQueryOptions {
  period: DashboardPeriod;
  custom?: DateRange | null;
}

export const dashboardKeys = {
  all: ["dashboard-cockpit"] as const,
  snapshot: (options: DashboardQueryOptions) =>
    ["dashboard-cockpit", "snapshot", options.period, options.custom ?? null] as const,
};

function useDashboardSnapshot(options: DashboardQueryOptions): UseQueryResult<DashboardSnapshot> {
  return useQuery<DashboardSnapshot>({
    queryKey: dashboardKeys.snapshot(options),
    queryFn: () => loadDashboardSnapshot({ period: options.period, custom: options.custom ?? null }),
    staleTime: 60_000,
  });
}

export function useDashboardMetrics(
  options: DashboardQueryOptions,
): UseQueryResult<DashboardSnapshot> & { metrics: DashboardMetricsModel | undefined } {
  const query = useDashboardSnapshot(options);
  return { ...query, metrics: query.data?.metrics };
}

export function useDashboardAnalytics(
  options: DashboardQueryOptions,
): UseQueryResult<DashboardSnapshot> & { analytics: DashboardAnalyticsModel | undefined } {
  const query = useDashboardSnapshot(options);
  return { ...query, analytics: query.data?.analytics };
}

export function useDashboardInsights(
  options: DashboardQueryOptions,
): UseQueryResult<DashboardSnapshot> & { insights: DashboardInsight[] } {
  const query = useDashboardSnapshot(options);
  return { ...query, insights: query.data?.insights ?? [] };
}
