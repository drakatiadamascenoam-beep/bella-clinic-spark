/**
 * Contratos públicos do módulo Bella Intelligence (CDSS).
 *
 * Governança clínica (Soberania Clínica — ADR Sprint 10):
 * - Toda saída de IA é apoio à decisão, NUNCA diagnóstico ou prescrição.
 * - `confidence` mede a coerência do motor (regras/LLM), não probabilidade diagnóstica.
 * - `requiresProfessionalConfirmation` é sempre `true` em recomendações clínicas.
 */

/** Papel do autor de uma mensagem no chat clínico com a Bella IA. */
export type ChatRole = "user" | "assistant" | "system";

/** Mensagem de chat trocada com o assistente clínico. */
export interface ChatMessage {
  readonly id: string;
  readonly role: ChatRole;
  readonly content: string;
  readonly createdAt: string;
}

/** Recomendação clínica de apoio à decisão (nunca prescritiva). */
export interface ClinicalRecommendation {
  readonly id: string;
  readonly protocolId: string;
  readonly protocolName: string;
  readonly rationale: string;
  readonly score: number;
  readonly confidence: number;
  readonly disclaimer: string;
  readonly requiresProfessionalConfirmation: true;
}

/** Origem de um insight: IA generativa, motor de regras determinístico ou sistema. */
export type InsightOrigin = "AI" | "RULE_ENGINE" | "SYSTEM";

/** Severidade de um insight clínico ou operacional. */
export type InsightSeverity = "info" | "warning" | "critical";

/** Base comum de qualquer insight produzido pela Bella Intelligence. */
export interface InsightBase {
  readonly id: string;
  readonly severity: InsightSeverity;
  readonly category: string;
  readonly title: string;
  readonly description: string;
  readonly recommendation: string;
  readonly createdAt: string;
  readonly origin: InsightOrigin;
}

/** Insight voltado ao dashboard operacional (métricas, anomalias, tendências). */
export interface DashboardInsight extends InsightBase {
  readonly metric: string;
  readonly value: number;
  readonly threshold: number;
}

/** Insight voltado ao contexto clínico de um atendimento/paciente. */
export interface ClinicalInsight extends InsightBase {
  readonly patientId: string | null;
  readonly requiresProfessionalConfirmation: true;
  readonly disclaimer: string;
}

/** Fonte que produziu uma validação clínica textual. */
export type ValidationSource = "LLM" | "LOCAL_RULES";

/** Resultado da validação de um texto de evolução clínica. */
export interface ClinicalValidationResult {
  readonly score: number;
  readonly issues: readonly string[];
  readonly recommendations: readonly string[];
  readonly confidence: number;
  readonly validationSource: ValidationSource;
  readonly requiresProfessionalConfirmation: true;
  readonly disclaimer: string;
}

/** Modo de execução efetivo de uma chamada de IA. */
export type AIExecutionMode = "LLM" | "LOCAL_RULES";

/** Metadados de observabilidade de cada execução do orquestrador de IA. */
export interface AIExecutionMetadata {
  readonly requestId: string;
  readonly timestamp: string;
  readonly provider: string;
  readonly model: string;
  readonly providerVersion: string;
  readonly promptVersion: string;
  readonly executionMode: AIExecutionMode;
  readonly latencyMs: number;
  readonly fallbackUsed: boolean;
  readonly success: boolean;
  readonly errorCode: string | null;
}

/** Status de disponibilidade de um provedor de IA no registro. */
export interface AIProviderStatus {
  readonly name: string;
  readonly model: string;
  readonly providerVersion: string;
  readonly available: boolean;
  readonly priority: number;
  readonly lastCheckedAt: string;
}

/** Resposta bruta de um provedor de IA (antes da normalização/guardrails). */
export interface AIProviderResponse {
  readonly text: string;
  readonly model: string;
  readonly providerVersion: string;
}

/** Requisição enviada a um provedor de IA. */
export interface AIProviderRequest {
  readonly systemPrompt: string;
  readonly userPrompt: string;
  readonly temperature?: number;
}

/** Resultado combinado de uma execução do orquestrador, com metadados. */
export interface AIExecutionResult<T> {
  readonly data: T;
  readonly metadata: AIExecutionMetadata;
}
