import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

/**
 * Dashboard service — Bella Knowledge Graph v3.0
 *
 * Toda leitura acontece no servidor, autenticada, respeitando RLS.
 * Nenhum dado é mockado: quando uma fonte ainda não existe no schema,
 * a métrica retorna `null` (fonte indisponível) e a UI exibe Empty State.
 */

interface QueryError {
  message: string;
  code?: string;
}

interface QueryResult {
  data: unknown;
  count: number | null;
  error: QueryError | null;
}

interface QueryBuilder extends PromiseLike<QueryResult> {
  select(columns: string, options?: { count?: "exact"; head?: boolean }): QueryBuilder;
  eq(column: string, value: string | number | boolean): QueryBuilder;
  gte(column: string, value: string): QueryBuilder;
  order(column: string, options: { ascending: boolean }): QueryBuilder;
  limit(count: number): QueryBuilder;
}

interface MinimalSupabaseClient {
  from(table: string): QueryBuilder;
}

export interface DashboardMetric {
  /** Valor apurado, ou null quando a fonte de dados ainda não está disponível. */
  value: number | null;
  /** Nome da tabela do Knowledge Graph que originou a métrica. */
  source: string;
}

export interface RecentEncounter {
  id: string;
  patientName: string | null;
  professionalName: string | null;
  status: string | null;
  occurredAt: string | null;
}

export interface DashboardMetrics {
  totalPatients: DashboardMetric;
  monthlyEncounters: DashboardMetric;
  activeProtocols: DashboardMetric;
  activeProfessionals: DashboardMetric;
  recentEncounters: RecentEncounter[];
  /** true quando nenhuma fonte do Knowledge Graph respondeu. */
  sourcesUnavailable: boolean;
}

const PATIENTS_TABLE = "patients";
const ENCOUNTERS_TABLE = "encounters";
const PROTOCOLS_TABLE = "protocols";
const PROFESSIONALS_TABLE = "professionals";

function startOfCurrentMonthISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

async function safeCount(
  client: MinimalSupabaseClient,
  table: string,
  refine?: (query: QueryBuilder) => QueryBuilder,
): Promise<DashboardMetric> {
  try {
    const base = client.from(table).select("*", { count: "exact", head: true });
    const { count, error } = await (refine ? refine(base) : base);
    if (error) return { value: null, source: table };
    return { value: count ?? 0, source: table };
  } catch {
    return { value: null, source: table };
  }
}

function toStringOrNull(value: unknown): string | null {
  return typeof value === "string" && value.length > 0 ? value : null;
}

function normalizeEncounter(row: unknown): RecentEncounter | null {
  if (typeof row !== "object" || row === null) return null;
  const record = row as Record<string, unknown>;
  const id = toStringOrNull(record.id);
  if (!id) return null;

  return {
    id,
    patientName: toStringOrNull(record.patient_name) ?? toStringOrNull(record.patient_id),
    professionalName:
      toStringOrNull(record.professional_name) ?? toStringOrNull(record.professional_id),
    status: toStringOrNull(record.status),
    occurredAt:
      toStringOrNull(record.occurred_at) ??
      toStringOrNull(record.started_at) ??
      toStringOrNull(record.created_at),
  };
}

async function safeRecentEncounters(client: MinimalSupabaseClient): Promise<RecentEncounter[]> {
  try {
    const { data, error } = await client
      .from(ENCOUNTERS_TABLE)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error || !Array.isArray(data)) return [];
    return data
      .map(normalizeEncounter)
      .filter((item): item is RecentEncounter => item !== null);
  } catch {
    return [];
  }
}

export const getDashboardMetrics = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<DashboardMetrics> => {
    const client = context.supabase as unknown as MinimalSupabaseClient;
    const monthStart = startOfCurrentMonthISO();

    const [totalPatients, monthlyEncounters, activeProtocols, activeProfessionals, recentEncounters] =
      await Promise.all([
        safeCount(client, PATIENTS_TABLE),
        safeCount(client, ENCOUNTERS_TABLE, (q) => q.gte("created_at", monthStart)),
        safeCount(client, PROTOCOLS_TABLE, (q) => q.eq("is_active", true)),
        safeCount(client, PROFESSIONALS_TABLE, (q) => q.eq("is_active", true)),
        safeRecentEncounters(client),
      ]);

    const metrics = [totalPatients, monthlyEncounters, activeProtocols, activeProfessionals];

    return {
      totalPatients,
      monthlyEncounters,
      activeProtocols,
      activeProfessionals,
      recentEncounters,
      sourcesUnavailable: metrics.every((metric) => metric.value === null),
    };
  });
