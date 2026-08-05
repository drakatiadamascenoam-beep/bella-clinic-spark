/**
 * Provedor OpenAI (via Lovable AI Gateway). Módulo server-only.
 */

import type { AIProvider } from "./AIProvider";
import type { AIProviderRequest, AIProviderResponse } from "../types/ai.types";
import { callGateway } from "./gateway-client";

const MODEL_ID = "openai/gpt-5-mini";
const PROVIDER_VERSION = "gateway-2025-01";

export const OpenAIProvider: AIProvider = {
  name: "OpenAI",
  model: MODEL_ID,
  providerVersion: PROVIDER_VERSION,
  async isAvailable(): Promise<boolean> {
    return typeof process.env["LOVABLE_API_KEY"] === "string" && process.env["LOVABLE_API_KEY"]!.length > 0;
  },
  async generate(request: AIProviderRequest): Promise<AIProviderResponse> {
    return callGateway(MODEL_ID, PROVIDER_VERSION, request);
  },
};
