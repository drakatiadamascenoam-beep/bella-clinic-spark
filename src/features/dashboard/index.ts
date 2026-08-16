/**
 * Contrato público do módulo Dashboard (Cockpit Executivo).
 * Consumidores externos usam EXCLUSIVAMENTE este barrel.
 */
export { DashboardPage } from "./pages/DashboardPage";
export {
  useDashboardMetrics,
  useDashboardAnalytics,
  useDashboardInsights,
  dashboardKeys,
} from "./hooks/useDashboard";
export type {
  DashboardInsight,
  DashboardInsightSeverity,
  DashboardMetricsModel,
  DashboardAnalyticsModel,
  DashboardSnapshot,
  DashboardPeriod,
  MetricCardModel,
} from "./types/dashboard.types";
