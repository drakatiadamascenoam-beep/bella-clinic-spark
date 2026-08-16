import type { DashboardPeriod, DateRange } from "../domain/dashboard-filters";
import type { DashboardInsight } from "../domain/dashboard-insights";

/**
 * Contratos de apresentação do Cockpit Executivo.
 * A UI consome exclusivamente estes modelos — nunca o domínio nem os mappers.
 */

export type TrendDirection = "up" | "down" | "neutral";
export type MetricFormat = "number" | "percent" | "decimal";

export interface MetricCardModel {
  id: string;
  label: string;
  /** null quando a fonte de dados ainda não está disponível. */
  value: number | null;
  format: MetricFormat;
  hint: string;
  trend: string | null;
  trendValue: number | null;
  trendDirection: TrendDirection;
  available: boolean;
}

export interface ChartPointModel {
  key: string;
  label: string;
  value: number;
}

export interface DistributionSliceModel extends ChartPointModel {
  share: number;
}

export interface ProfessionalPerformanceRow {
  id: string;
  name: string;
  appointments: number;
  attended: number;
  absences: number;
  cancellations: number;
  averageMinutes: number | null;
  occupancy: number | null;
}

/** Disponibilidade por fonte — permite degradar cada widget isoladamente. */
export interface DashboardAvailability {
  patients: boolean;
  attendances: boolean;
  schedule: boolean;
  professionals: boolean;
  protocols: boolean;
}

export interface DashboardPeriodModel {
  period: DashboardPeriod;
  range: DateRange;
  label: string;
}

export interface DashboardMetricsModel {
  cards: MetricCardModel[];
  period: DashboardPeriodModel;
  availability: DashboardAvailability;
}

export interface DashboardAnalyticsModel {
  attendanceTrend: ChartPointModel[];
  occupancyByHour: ChartPointModel[];
  protocolDistribution: DistributionSliceModel[];
  professionalRanking: DistributionSliceModel[];
  professionalPerformance: ProfessionalPerformanceRow[];
  availability: DashboardAvailability;
}

export interface DashboardSnapshot {
  metrics: DashboardMetricsModel;
  analytics: DashboardAnalyticsModel;
  insights: DashboardInsight[];
}

export type { DashboardInsight, DashboardInsightSeverity } from "../domain/dashboard-insights";
export type { DashboardPeriod, DateRange } from "../domain/dashboard-filters";
