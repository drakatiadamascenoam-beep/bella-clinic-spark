/**
 * Normalização de respostas de provedores de IA para os modelos de UI.
 */

import { sanitizeResponse } from "../domain/ai-ethical-guardrails";
import type { AIProviderResponse, ChatMessage } from "../types/ai.types";

/** Normaliza a resposta bruta de um provedor de IA em uma mensagem de chat segura. */
export function toChatMessage(response: AIProviderResponse, createdAt: string): ChatMessage {
  return {
    id: `msg-${createdAt}`,
    role: "assistant",
    content: sanitizeResponse(response.text),
    createdAt,
  };
}

/** Cria uma mensagem de chat do usuário a partir de texto livre. */
export function toUserChatMessage(content: string, createdAt: string): ChatMessage {
  return {
    id: `msg-${createdAt}-user`,
    role: "user",
    content,
    createdAt,
  };
}
