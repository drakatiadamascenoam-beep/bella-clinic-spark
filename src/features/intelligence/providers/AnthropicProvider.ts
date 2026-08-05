/**
 * Provedor Anthropic (via Lovable AI Gateway). Módulo server-only.
 *
 * O id de modelo Anthropic no catálogo do gateway não pôde ser confirmado
 * neste momento; por segurança este provedor permanece registrado (para
 * manter a ordem de prioridade OpenAI -> Anthropic -> Gemini -> LocalRule)
 * mas SEMPRE reporta `isAvailable() === false`, garantindo fallback seguro
 * até que o id do modelo seja validado explicitamente no catálogo.
 */

import type { AIProvider } from "./AIProvider";
import type { AIProviderRequest, AIProviderResponse } from "../types/ai.types";
import { callGateway } from "./gateway-client";

const MODEL_ID = "anthropic/claude-sonnet-4-5";
const PROVIDER_VERSION = "gateway-2025-01";

export const AnthropicProvider: AIProvider = {
  name: "Anthropic",
  model: MODEL_ID,
  providerVersion: PROVIDER_VERSION,
  async isAvailable(): Promise<boolean> {
    return false;
  },
  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    return callGateway(MODEL_ID, PROVIDER_VERSION, request);
  },
};
