/**
 * Seleção do provedor ativo (server-only helper, não é um arquivo de service fn).
 */
import type { AIProvider } from "../providers/AIProvider";
import { getOrderedProviders } from "../providers/provider-registry";
import type { AIProviderStatus } from "../types/ai.types";

/** Resolve o primeiro provedor disponível, respeitando a prioridade configurada. */
export async function resolveActiveProvider(): Promise<AIProvider> {
  for (const entry of getOrderedProviders()) {
    if (await entry.provider.isAvailable()) return entry.provider;
  }
  const fallback = getOrderedProviders().at(-1);
  if (!fallback) throw new Error("Nenhum provedor de IA registrado.");
  return fallback.provider;
}

/** Constrói o snapshot de status de todos os provedores registrados. */
export async function buildProviderStatusList(timestamp: string): Promise<readonly AIProviderStatus[]> {
  const entries = getOrderedProviders();
  return Promise.all(
    entries.map(async (entry) => ({
      name: entry.provider.name,
      model: entry.provider.model,
      providerVersion: entry.provider.providerVersion,
      available: await entry.provider.isAvailable(),
      priority: entry.priority,
      lastCheckedAt: timestamp,
    })),
  );
}
