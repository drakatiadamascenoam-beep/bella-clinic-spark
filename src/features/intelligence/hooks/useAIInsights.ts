import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { generateInsights } from "../services/ai-orchestrator.service";
import type { MetricPoint } from "../domain/ai-dashboard-engine";
import type { AIExecutionResult, DashboardInsight } from "../types/ai.types";

/** Hook de geração de insights operacionais a partir de métricas. */
export function useAIInsights() {
  const generate = useServerFn(generateInsights);
  return useMutation<AIExecutionResult<readonly DashboardInsight[]>, Error, readonly MetricPoint[]>({
    mutationFn: (metrics) => generate({ data: metrics }),
  });
}
