import { useEffect } from "react";
import { AlertTriangle, Info, Loader2, ShieldAlert } from "lucide-react";

import { Badge } from "@/components/ui/badge";

import { useAIInsights } from "../hooks/useAIInsights";
import type { DashboardInsight, InsightSeverity } from "../types/ai.types";
import type { MetricPoint } from "../types/intelligence-io.types";

export interface AIInsightBannerProps {
  /** Métricas operacionais a analisar. Vazio = nada a apresentar. */
  metrics: readonly MetricPoint[];
}

const SEVERITY_ICON: Record<InsightSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

const SEVERITY_LABEL: Record<InsightSeverity, string> = {
  info: "Informativo",
  warning: "Atenção",
  critical: "Crítico",
};

const SEVERITY_STYLE: Record<InsightSeverity, string> = {
  info: "border-border bg-card",
  warning: "border-gold/40 bg-gold/5",
  critical: "border-destructive/30 bg-destructive/5",
};

function InsightRow({ insight }: { insight: DashboardInsight }) {
  const Icon = SEVERITY_ICON[insight.severity];
  return (
    <li className={`flex gap-3 rounded-lg border p-4 ${SEVERITY_STYLE[insight.severity]}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-sm font-medium text-foreground">{insight.title}</p>
          <Badge variant={insight.severity === "critical" ? "destructive" : "secondary"}>
            {SEVERITY_LABEL[insight.severity]}
          </Badge>
          <span className="text-xs text-muted-foreground">{insight.category}</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">{insight.description}</p>
        <p className="mt-1 text-sm text-foreground">{insight.recommendation}</p>
      </div>
    </li>
  );
}

/** Banner de insights operacionais determinísticos gerados pela Bella Intelligence. */
export function AIInsightBanner({ metrics }: AIInsightBannerProps) {
  const { mutate, data, isPending, isError, error } = useAIInsights();
  const signature = metrics.map((m) => `${m.metric}:${m.value}:${m.threshold}`).join("|");

  useEffect(() => {
    if (metrics.length === 0) return;
    mutate(metrics);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signature]);

  if (metrics.length === 0) {
    return (
      <section aria-label="Insights operacionais" className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Nenhuma métrica operacional disponível para análise. Fonte indisponível no Bella Knowledge
          Graph.
        </p>
      </section>
    );
  }

  if (isPending) {
    return (
      <section
        aria-label="Insights operacionais"
        aria-busy="true"
        className="flex items-center gap-2 rounded-lg border border-border bg-card p-4"
      >
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">Analisando métricas operacionais…</p>
      </section>
    );
  }

  if (isError) {
    return (
      <section
        role="alert"
        aria-label="Insights operacionais"
        className="rounded-lg border border-destructive/30 bg-destructive/5 p-4"
      >
        <p className="text-sm font-medium text-foreground">Não foi possível gerar insights</p>
        <p className="text-sm text-muted-foreground">
          {error instanceof Error && error.message.length > 0
            ? error.message
            : "Tente novamente em alguns instantes."}
        </p>
      </section>
    );
  }

  const insights = data?.data ?? [];

  if (insights.length === 0) {
    return (
      <section aria-label="Insights operacionais" className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Nenhuma anomalia identificada nas métricas analisadas.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Insights operacionais" className="flex flex-col gap-3">
      <ul className="flex flex-col gap-3">
        {insights.map((insight) => (
          <InsightRow key={insight.id} insight={insight} />
        ))}
      </ul>
      {data && (
        <p className="text-xs text-muted-foreground">
          Origem: {data.metadata.executionMode === "LLM" ? "modelo generativo" : "regras locais"} ·
          Provedor {data.metadata.provider} · {data.metadata.latencyMs} ms
        </p>
      )}
    </section>
  );
}
