/**
 * Registro extensível de provedores de IA, com prioridade configurável.
 *
 * Ordem padrão: OpenAI -> Anthropic -> Gemini -> LocalRule (fallback final,
 * sempre disponível). Desacoplado do orquestrador: o orquestrador apenas
 * consome `getOrderedProviders()`.
 */

import type { AIProvider } from "./AIProvider";
import { OpenAIProvider } from "./OpenAIProvider";
import { AnthropicProvider } from "./AnthropicProvider";
import { GeminiProvider } from "./GeminiProvider";
import { LocalRuleProvider } from "./LocalRuleProvider";

/** Entrada do registro com prioridade explícita (menor valor = maior prioridade). */
export interface RegisteredProvider {
  readonly provider: AIProvider;
  readonly priority: number;
}

const DEFAULT_REGISTRY: readonly RegisteredProvider[] = [
  { provider: OpenAIProvider, priority: 1 },
  { provider: AnthropicProvider, priority: 2 },
  { provider: GeminiProvider, priority: 3 },
  { provider: LocalRuleProvider, priority: 4 },
];

/** Retorna os provedores registrados ordenados por prioridade crescente. */
export function getOrderedProviders(): readonly RegisteredProvider[] {
  return [...DEFAULT_REGISTRY].sort((a, b) => a.priority - b.priority);
}
