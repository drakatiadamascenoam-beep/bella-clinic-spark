/**
 * Contrato público do módulo Bella Intelligence.
 * Outros domínios (ex.: Dashboard Executivo) consomem EXCLUSIVAMENTE este barrel.
 */

export { BellaAIPage } from "./pages/BellaAIPage";

export { AIInsightBanner, type AIInsightBannerProps } from "./components/AIInsightBanner";
export { AIStatusBadge, type AIStatusBadgeProps } from "./components/AIStatusBadge";
export {
  BellaAIAssistantSheet,
  type BellaAIAssistantSheetProps,
} from "./components/BellaAIAssistantSheet";
export {
  ClinicalRecommendationCard,
  type ClinicalRecommendationCardProps,
} from "./components/ClinicalRecommendationCard";
export {
  ClinicalValidationBadge,
  type ClinicalValidationBadgeProps,
} from "./components/ClinicalValidationBadge";

export { useAIInsights } from "./hooks/useAIInsights";
export { useAIProviderStatus } from "./hooks/useAIProviderStatus";
export { useClinicalAssistant } from "./hooks/useClinicalAssistant";
export {
  useProtocolRecommendations,
  type RecommendProtocolsInput,
} from "./hooks/useProtocolRecommendations";
export { useValidateClinicalText } from "./hooks/useValidateClinicalText";

export type {
  AIExecutionMetadata,
  AIExecutionMode,
  AIExecutionResult,
  AIProviderStatus,
  ChatMessage,
  ChatRole,
  ClinicalInsight,
  ClinicalRecommendation,
  ClinicalValidationResult,
  DashboardInsight,
  InsightBase,
  InsightOrigin,
  InsightSeverity,
  ValidationSource,
} from "./types/ai.types";

export type {
  BuildClinicalContextInput,
  ClinicalContextAttendance,
  ClinicalContextPatient,
  ClinicalContextProfessional,
  ClinicalContextProtocol,
  MasterProtocol,
  MetricPoint,
} from "./types/intelligence-io.types";
