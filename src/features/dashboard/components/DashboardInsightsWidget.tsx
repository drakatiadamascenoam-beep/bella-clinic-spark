import { AlertTriangle, Info, ShieldAlert } from "lucide-react";
import { WidgetShell } from "./WidgetShell";
import type { DashboardInsight, DashboardInsightSeverity } from "../types/dashboard.types";

const severityIcon: Record<DashboardInsightSeverity, typeof Info> = {
  info: Info,
  warning: AlertTriangle,
  critical: ShieldAlert,
};

const severityTone: Record<DashboardInsightSeverity, string> = {
  info: "border-border/70 bg-muted/40 text-muted-foreground",
  warning: "border-gold/40 bg-gold/10 text-foreground",
  critical: "border-destructive/30 bg-destructive/5 text-foreground",
};

export interface DashboardInsightsWidgetProps {
  insights: DashboardInsight[];
  isLoading?: boolean;
  isError?: boolean;
  onRetry?: () => void;
}

export function DashboardInsightsWidget({
  insights,
  isLoading,
  isError,
  onRetry,
}: DashboardInsightsWidgetProps) {
  return (
    <WidgetShell
      title="Insights do cockpit"
      description="Leituras estratégicas derivadas dos indicadores do período"
      isLoading={isLoading}
      isError={isError}
      isEmpty={insights.length === 0}
      emptyMessage="Nenhum sinal relevante identificado no período selecionado."
      onRetry={onRetry}
    >
      <ul className="flex flex-col gap-3">
        {insights.map((insight) => {
          const Icon = severityIcon[insight.severity];
          return (
            <li
              key={insight.id}
              className={`flex items-start gap-3 rounded-xl border p-4 ${severityTone[insight.severity]}`}
            >
              <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">{insight.title}</p>
                <p className="text-sm text-muted-foreground">{insight.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </WidgetShell>
  );
}
