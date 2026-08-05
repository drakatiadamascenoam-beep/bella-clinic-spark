import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { askClinicalAssistant } from "../services/ai-orchestrator.service";
import type { BuildClinicalContextInput } from "../domain/clinical-context";
import type { AIExecutionResult, ChatMessage } from "../types/ai.types";

/** Hook de chat clínico com a Bella IA (apoio à decisão, não diagnóstico). */
export function useClinicalAssistant() {
  const ask = useServerFn(askClinicalAssistant);
  return useMutation<AIExecutionResult<ChatMessage>, Error, BuildClinicalContextInput>({
    mutationFn: (input) => ask({ data: input }),
  });
}
