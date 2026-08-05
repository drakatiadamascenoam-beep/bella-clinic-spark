/**
 * Provedor de fallback determinístico (motor local de regras).
 *
 * Sempre disponível, nunca falha, nunca usa aleatoriedade ou rede — garante
 * o princípio de "Fallback Determinístico": mesma entrada, mesma saída.
 */

import type { AIProvider } from "./AIProvider";
import type { AIProviderRequest, AIProviderResponse } from "../types/ai.types";

const PROVIDER_VERSION = "local-rules-1.0.0";

/** Deriva uma resposta textual determinística a partir do prompt do usuário, sem IA generativa. */
function buildLocalAnswer(request: AIProviderRequest): string {
  const trimmedQuestion = request.userPrompt.trim();
  if (trimmedQuestion.length === 0) {
    return "Não há dados suficientes no contexto para uma resposta determinística. Consulte um profissional.";
  }
  return `Resposta baseada em regras locais determinísticas para: "${trimmedQuestion}". Nenhum modelo generativo foi utilizado nesta execução.`;
}

export const LocalRuleProvider: AIProvider = {
  name: "LocalRule",
  model: "local-rule-engine",
  providerVersion: PROVIDER_VERSION,
  async isAvailable(): Promise<boolean> {
    return true;
  },
  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    return {
      text: buildLocalAnswer(request),
      model: "local-rule-engine",
      providerVersion: PROVIDER_VERSION,
    };
  },
};
