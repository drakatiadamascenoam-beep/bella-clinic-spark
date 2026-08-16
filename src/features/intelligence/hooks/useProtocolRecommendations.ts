import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { recommendProtocols } from "../services/ai-orchestrator.service";
import type { MasterProtocol } from "../domain/ai-clinical-engine";
import type { AIExecutionResult, ClinicalRecommendation } from "../types/ai.types";

/** Entrada da recomendação determinística de protocolos-mestre. */
export interface RecommendProtocolsInput {
  readonly history: readonly string[];
  readonly complaint: string;
  readonly protocols: readonly MasterProtocol[];
}

/** Hook de recomendação determinística de protocolos-mestre. */
export function useProtocolRecommendations() {
  const recommend = useServerFn(recommendProtocols);
  return useMutation<AIExecutionResult<readonly ClinicalRecommendation[]>, Error, RecommendProtocolsInput>({
    mutationFn: (input) => recommend({ data: input }),
  });
}
