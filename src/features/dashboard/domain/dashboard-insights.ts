/**
 * Domínio puro — Ponto de extensão de Insights do Cockpit Executivo.
 *
 * A interface `DashboardInsight` é estável e será alimentada pela camada de
 * IA (Bella Intelligence, Sprint 10). Aqui vivem apenas regras determinísticas:
 * enquanto não houver dados suficientes, o retorno é um array vazio.
 */

export type DashboardInsightSeverity = "info" | "warning" | "critical";

export interface DashboardInsight {
  id: string;
  severity: DashboardInsightSeverity;
  title: string;
  description: string;
}

export interface DashboardInsightInput {
  occupancyRate: number | null;
  absenteeismRate: number | null;
  cancellationRate: number | null;
  attendancesTotal: number;
  newPatients: number;
  activeProfessionals: number;
}

/** Limiares clínicos-operacionais adotados como convenção da plataforma. */
export const INSIGHT_THRESHOLDS = {
  lowOccupancy: 55,
  highOccupancy: 92,
  highAbsenteeism: 15,
  highCancellation: 20,
} as const;

/**
 * Regras determinísticas de base. Sem dados apurados, retorna [].
 * A Sprint 10 pode concatenar insights assistidos por IA a este resultado.
 */
export function buildBaseInsights(input: DashboardInsightInput): DashboardInsight[] {
  const insights: DashboardInsight[] = [];

  if (input.occupancyRate !== null) {
    if (input.occupancyRate < INSIGHT_THRESHOLDS.lowOccupancy) {
      insights.push({
        id: "occupancy-low",
        severity: "warning",
        title: "Ocupação da agenda abaixo do ideal",
        description: `A agenda operou a ${input.occupancyRate}% da capacidade da equipe no período selecionado.`,
      });
    } else if (input.occupancyRate >= INSIGHT_THRESHOLDS.highOccupancy) {
      insights.push({
        id: "occupancy-high",
        severity: "info",
        title: "Agenda próxima da capacidade máxima",
        description: `Ocupação de ${input.occupancyRate}%. Avalie ampliar janelas de atendimento ou a equipe ativa.`,
      });
    }
  }

  if (input.absenteeismRate !== null && input.absenteeismRate >= INSIGHT_THRESHOLDS.highAbsenteeism) {
    insights.push({
      id: "absenteeism-high",
      severity: "critical",
      title: "Absenteísmo elevado",
      description: `${input.absenteeismRate}% dos compromissos com desfecho terminaram em falta. Reforce a confirmação prévia.`,
    });
  }

  if (
    input.cancellationRate !== null &&
    input.cancellationRate >= INSIGHT_THRESHOLDS.highCancellation
  ) {
    insights.push({
      id: "cancellation-high",
      severity: "warning",
      title: "Cancelamentos acima do esperado",
      description: `${input.cancellationRate}% dos compromissos do período foram cancelados.`,
    });
  }

  if (input.attendancesTotal > 0 && input.newPatients === 0) {
    insights.push({
      id: "no-new-patients",
      severity: "info",
      title: "Nenhum paciente novo no período",
      description: "A operação atendeu apenas a base já cadastrada no intervalo selecionado.",
    });
  }

  return insights;
}
