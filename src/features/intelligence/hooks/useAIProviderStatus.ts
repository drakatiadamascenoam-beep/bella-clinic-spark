import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getAIProviderStatus } from "../services/ai-orchestrator.service";
import type { AIProviderStatus } from "../types/ai.types";

/** Hook de observabilidade do registro de provedores de IA. */
export function useAIProviderStatus() {
  const fetchStatus = useServerFn(getAIProviderStatus);
  return useQuery<readonly AIProviderStatus[]>({
    queryKey: ["intelligence", "provider-status"],
    queryFn: () => fetchStatus(),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
