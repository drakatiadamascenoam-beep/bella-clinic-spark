/**
 * Lógica de orquestração da Bella Intelligence (server-only).
 *
 * Fluxo: contexto imutável -> prompt versionado -> provedor do registro ->
 * fallback determinístico -> guardrails éticos -> metadados de execução.
 * NUNCA lança exceção 500: qualquer falha degrada para LOCAL_RULES.
 */

import { randomUUID } from "node:crypto";
import { buildClinicalContext, type BuildClinicalContextInput } from "../domain/clinical-context";
import { buildClinicalPrompt, PROMPT_VERSION } from "../domain/ai-prompt-builder";
import { sanitizeResponse, sanitizePrompt } from "../domain/ai-ethical-guardrails";
import {
  recommendMasterProtocols,
  validateClinicalEvolution,
  type MasterProtocol,
} from "../domain/ai-clinical-engine";
import { analyzeDashboardMetrics, type MetricPoint } from "../domain/ai-dashboard-engine";
import { resolveActiveProvider, buildProviderStatusList } from "./ai-provider.service";
import { LocalRuleProvider } from "../providers/LocalRuleProvider";
import type {
  AIExecutionMetadata,
  AIExecutionResult,
  AIProviderStatus,
  ChatMessage,
  ClinicalRecommendation,
  ClinicalValidationResult,
  DashboardInsight,
} from "../types/ai.types";

function buildMetadata(params: {
  requestId: string;
  timestamp: string;
  provider: string;
  model: string;
  providerVersion: string;
  executionMode: "LLM" | "LOCAL_RULES";
  latencyMs: number;
  fallbackUsed: boolean;
  success: boolean;
  errorCode: string | null;
}): AIExecutionMetadata {
  return { ...params, promptVersion: PROMPT_VERSION };
}

/** Executa a pergunta clínica do usuário no assistente Bella IA, com fallback garantido. */
export async function runClinicalAssistant(
  contextInput: BuildClinicalContextInput,
): Promise<AIExecutionResult<ChatMessage>> {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const timestamp = new Date(startedAt).toISOString();
  const context = buildClinicalContext(contextInput);
  const prompt = buildClinicalPrompt(context);

  try {
    const provider = await resolveActiveProvider();
    const response = await provider.generate({
      systemPrompt: prompt.systemPrompt,
      userPrompt: prompt.fullPrompt,
    });
    const content = sanitizeResponse(response.text);
    const executionMode = provider.name === LocalRuleProvider.name ? "LOCAL_RULES" : "LLM";

    return {
      data: { id: `msg-${requestId}`, role: "assistant", content, createdAt: timestamp },
      metadata: buildMetadata({
        requestId,
        timestamp,
        provider: provider.name,
        model: response.model,
        providerVersion: response.providerVersion,
        executionMode,
        latencyMs: Date.now() - startedAt,
        fallbackUsed: executionMode === "LOCAL_RULES",
        success: true,
        errorCode: null,
      }),
    };
  } catch (error) {
    const fallback = await LocalRuleProvider.generate({
      systemPrompt: prompt.systemPrompt,
      userPrompt: sanitizePrompt(context.question),
    });
    return {
      data: {
        id: `msg-${requestId}`,
        role: "assistant",
        content: sanitizeResponse(fallback.text),
        createdAt: timestamp,
      },
      metadata: buildMetadata({
        requestId,
        timestamp,
        provider: LocalRuleProvider.name,
        model: LocalRuleProvider.model,
        providerVersion: LocalRuleProvider.providerVersion,
        executionMode: "LOCAL_RULES",
        latencyMs: Date.now() - startedAt,
        fallbackUsed: true,
        success: true,
        errorCode: error instanceof Error ? error.message : "UNKNOWN_ERROR",
      }),
    };
  }
}

interface RecommendProtocolsInput {
  readonly history: readonly string[];
  readonly complaint: string;
  readonly protocols: readonly MasterProtocol[];
}

/** Recomenda protocolos-mestre com base em histórico e queixa (sempre via motor determinístico). */
export async function runProtocolRecommendation(
  input: RecommendProtocolsInput,
): Promise<AIExecutionResult<readonly ClinicalRecommendation[]>> {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const timestamp = new Date(startedAt).toISOString();
  const data = recommendMasterProtocols(input);

  return {
    data,
    metadata: buildMetadata({
      requestId,
      timestamp,
      provider: LocalRuleProvider.name,
      model: LocalRuleProvider.model,
      providerVersion: LocalRuleProvider.providerVersion,
      executionMode: "LOCAL_RULES",
      latencyMs: Date.now() - startedAt,
      fallbackUsed: false,
      success: true,
      errorCode: null,
    }),
  };
}

/** Gera insights operacionais para o dashboard a partir de métricas (motor determinístico). */
export async function runDashboardInsights(
  metrics: readonly MetricPoint[],
): Promise<AIExecutionResult<readonly DashboardInsight[]>> {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const timestamp = new Date(startedAt).toISOString();
  const data = analyzeDashboardMetrics({ metrics, createdAt: timestamp });

  return {
    data,
    metadata: buildMetadata({
      requestId,
      timestamp,
      provider: LocalRuleProvider.name,
      model: LocalRuleProvider.model,
      providerVersion: LocalRuleProvider.providerVersion,
      executionMode: "LOCAL_RULES",
      latencyMs: Date.now() - startedAt,
      fallbackUsed: false,
      success: true,
      errorCode: null,
    }),
  };
}

/** Valida um texto de evolução clínica, sempre por meio do motor local determinístico. */
export async function runClinicalValidation(
  text: string,
): Promise<AIExecutionResult<ClinicalValidationResult>> {
  const requestId = randomUUID();
  const startedAt = Date.now();
  const timestamp = new Date(startedAt).toISOString();
  const data = validateClinicalEvolution(text);

  return {
    data,
    metadata: buildMetadata({
      requestId,
      timestamp,
      provider: LocalRuleProvider.name,
      model: LocalRuleProvider.model,
      providerVersion: LocalRuleProvider.providerVersion,
      executionMode: "LOCAL_RULES",
      latencyMs: Date.now() - startedAt,
      fallbackUsed: false,
      success: true,
      errorCode: null,
    }),
  };
}

/** Retorna o status de todos os provedores registrados (para dashboard de observabilidade). */
export async function getProviderStatusSnapshot(): Promise<readonly AIProviderStatus[]> {
  return buildProviderStatusList(new Date().toISOString());
}
