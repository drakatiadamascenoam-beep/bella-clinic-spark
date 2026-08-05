/**
 * Contrato de um provedor de IA para a Bella Intelligence.
 *
 * Módulo server-only: nunca deve ser importado por código de cliente.
 * A camada de serviço (`services/*.service.ts`) é a única porta de entrada.
 */

import type { AIProviderRequest, AIProviderResponse } from "../types/ai.types";

/** Interface comum a todo provedor (LLM via gateway ou motor local de regras). */
export interface AIProvider {
  readonly name: string;
  readonly model: string;
  readonly providerVersion: string;
  /** Verifica se o provedor está disponível para uso agora. */
  isAvailable(): Promise<boolean>;
  /** Gera uma resposta a partir da requisição estruturada. */
  generate(request: AIProviderRequest): Promise<AIProviderResponse>;
}
