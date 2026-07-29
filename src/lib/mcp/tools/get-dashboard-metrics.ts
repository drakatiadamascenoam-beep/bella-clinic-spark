import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser, unauthenticated } from "../supabase";

const SOURCES = {
  totalPatients: "patients",
  activeProtocols: "protocols",
  activeProfessionals: "professionals",
  monthlyEncounters: "encounters",
} as const;

type MetricKey = keyof typeof SOURCES;

interface Metric {
  value: number | null;
  source: string;
}

function startOfCurrentMonthISO(): string {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
}

export default defineTool({
  name: "get_dashboard_metrics",
  title: "Métricas do dashboard",
  description:
    "Lê as métricas operacionais da Bella IA (pacientes, atendimentos do mês, protocolos ativos e profissionais ativos) direto do banco, como o usuário conectado. Retorna null quando a fonte ainda não existe no schema.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();

    const supabase = supabaseForUser(ctx);
    const monthStart = startOfCurrentMonthISO();

    async function count(key: MetricKey): Promise<Metric> {
      const table = SOURCES[key];
      try {
        let query = supabase.from(table).select("*", { count: "exact", head: true });
        if (key === "monthlyEncounters") query = query.gte("created_at", monthStart);
        if (key === "activeProtocols" || key === "activeProfessionals") {
          query = query.eq("is_active", true);
        }
        const { count: total, error } = await query;
        return { value: error ? null : (total ?? 0), source: table };
      } catch {
        return { value: null, source: table };
      }
    }

    const [totalPatients, monthlyEncounters, activeProtocols, activeProfessionals] =
      await Promise.all([
        count("totalPatients"),
        count("monthlyEncounters"),
        count("activeProtocols"),
        count("activeProfessionals"),
      ]);

    const metrics = {
      totalPatients,
      monthlyEncounters,
      activeProtocols,
      activeProfessionals,
      sourcesUnavailable: [totalPatients, monthlyEncounters, activeProtocols, activeProfessionals].every(
        (metric) => metric.value === null,
      ),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(metrics) }],
      structuredContent: metrics,
    };
  },
});
