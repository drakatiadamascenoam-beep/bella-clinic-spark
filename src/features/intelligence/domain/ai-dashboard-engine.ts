/**
 * Motor puro de análise de métricas do dashboard operacional.
 *
 * Produz `DashboardInsight` a partir de séries de métricas, sem I/O,
 * aleatoriedade ou relógio. `origin` é sempre `'RULE_ENGINE'`.
 */

import type { DashboardInsight, InsightSeverity } from "../types/ai.types";

/** Ponto de métrica operacional a ser analisado. */
export interface MetricPoint {
  readonly metric: string;
  readonly category: string;
  readonly value: number;
  readonly threshold: number;
  readonly higherIsWorse: boolean;
}

interface AnalyzeDashboardMetricsOptions {
  readonly metrics: readonly MetricPoint[];
  readonly createdAt: string;
}

function severityFor(deviationRatio: number): InsightSeverity {
  if (deviationRatio >= 0.5) return "critical";
  if (deviationRatio >= 0.2) return "warning";
  return "info";
}

function buildRecommendation(metric: MetricPoint, deviates: boolean): string {
  if (!deviates) return `Métrica "${metric.metric}" dentro do intervalo esperado.`;
  return metric.higherIsWorse
    ? `Investigar aumento de "${metric.metric}" acima do limite operacional.`
    : `Investigar queda de "${metric.metric}" abaixo do limite operacional.`;
}

/** Analisa métricas do dashboard e retorna insights determinísticos baseados em regras. */
export function analyzeDashboardMetrics(
  options: AnalyzeDashboardMetricsOptions,
): readonly DashboardInsight[] {
  return options.metrics
    .map((metric, index) => {
      const deviates = metric.higherIsWorse
        ? metric.value > metric.threshold
        : metric.value < metric.threshold;

      if (!deviates) return null;

      const deviationRatio =
        metric.threshold === 0 ? 1 : Math.abs(metric.value - metric.threshold) / Math.abs(metric.threshold);

      const insight: DashboardInsight = {
        id: `insight-${metric.category}-${index}`,
        severity: severityFor(deviationRatio),
        category: metric.category,
        title: `Anomalia em ${metric.metric}`,
        description: `Valor atual ${metric.value} versus limite esperado ${metric.threshold}.`,
        recommendation: buildRecommendation(metric, deviates),
        createdAt: options.createdAt,
        origin: "RULE_ENGINE",
        metric: metric.metric,
        value: metric.value,
        threshold: metric.threshold,
      };
      return insight;
    })
    .filter((insight): insight is DashboardInsight => insight !== null);
}
