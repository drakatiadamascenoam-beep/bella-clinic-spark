/**
 * Cliente compartilhado do Lovable AI Gateway (server-only).
 *
 * Usa `@ai-sdk/openai-compatible` apontando para o gateway da Lovable Cloud.
 * A chave é lida de `process.env['LOVABLE_API_KEY']` sempre dentro do handler
 * que efetivamente realiza a chamada — nunca em escopo de módulo.
 */

import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { generateText } from "ai";
import type { AIProviderRequest, AIProviderResponse } from "../types/ai.types";

const GATEWAY_BASE_URL = "https://ai.gateway.lovable.dev/v1";

/** Executa uma geração de texto via Lovable AI Gateway para o modelo informado. */
export async function callGateway(
  modelId: string,
  providerVersion: string,
  request: AIProviderRequest,
): Promise<AIProviderResponse> {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error("LOVABLE_API_KEY não configurada.");
  }

  const gateway = createOpenAICompatible({
    name: "lovable-ai-gateway",
    baseURL: GATEWAY_BASE_URL,
    headers: { "Lovable-API-Key": apiKey },
  });

  const result = await generateText({
    model: gateway(modelId),
    system: request.systemPrompt,
    prompt: request.userPrompt,
    temperature: request.temperature ?? 0.2,
  });

  return {
    text: result.text,
    model: modelId,
    providerVersion,
  };
}
