/**
 * Server functions públicas do orquestrador de IA (wrapper fino).
 *
 * Este arquivo contém APENAS imports, tipos e declarações de server function —
 * toda a lógica vive em `ai-orchestrator.server.ts`.
 */
import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import {
  getProviderStatusSnapshot,
  runClinicalAssistant,
  runClinicalValidation,
  runDashboardInsights,
  runProtocolRecommendation,
} from "./ai-orchestrator.server";
import type { BuildClinicalContextInput } from "../domain/clinical-context";
import type { MasterProtocol } from "../domain/ai-clinical-engine";
import type { MetricPoint } from "../domain/ai-dashboard-engine";

export const askClinicalAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): BuildClinicalContextInput => input as BuildClinicalContextInput)
  .handler(async ({ data }) => runClinicalAssistant(data));

export const recommendProtocols = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (input: unknown): { history: readonly string[]; complaint: string; protocols: readonly MasterProtocol[] } =>
      input as { history: readonly string[]; complaint: string; protocols: readonly MasterProtocol[] },
  )
  .handler(async ({ data }) => runProtocolRecommendation(data));

export const generateInsights = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): readonly MetricPoint[] => input as readonly MetricPoint[])
  .handler(async ({ data }) => runDashboardInsights(data));

export const validateClinicalText = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown): { text: string } => input as { text: string })
  .handler(async ({ data }) => runClinicalValidation(data.text));

export const getAIProviderStatus = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async () => getProviderStatusSnapshot());
