import { Loader2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import type { ClinicalRecommendation } from "../types/ai.types";

export interface ClinicalRecommendationCardProps {
  recommendations: readonly ClinicalRecommendation[];
  isPending?: boolean;
  isError?: boolean;
  errorMessage?: string | null;
  /** Mensagem exibida quando ainda não houve solicitação de recomendação. */
  idleMessage?: string;
  hasResult?: boolean;
}

/** Apresentação das recomendações de protocolos-mestre (apoio à decisão, nunca prescrição). */
export function ClinicalRecommendationCard({
  recommendations,
  isPending = false,
  isError = false,
  errorMessage = null,
  idleMessage = "Informe a queixa clínica para gerar recomendações de protocolos.",
  hasResult = false,
}: ClinicalRecommendationCardProps) {
  if (isPending) {
    return (
      <div
        aria-busy="true"
        aria-label="Carregando recomendações clínicas"
        className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4"
      >
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          Avaliando protocolos-mestre…
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    );
  }

  if (isError) {
    return (
      <div role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-4">
        <p className="text-sm font-medium text-foreground">
          Não foi possível gerar recomendações clínicas
        </p>
        <p className="text-sm text-muted-foreground">
          {errorMessage && errorMessage.length > 0
            ? errorMessage
            : "Tente novamente em alguns instantes."}
        </p>
      </div>
    );
  }

  if (!hasResult) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">{idleMessage}</p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          Nenhum protocolo-mestre correspondeu ao contexto informado.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {recommendations.map((recommendation) => (
        <li key={recommendation.id} className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-medium text-foreground">{recommendation.protocolName}</p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">Aderência {recommendation.score}%</Badge>
              <Badge variant="outline">
                Confiança {Math.round(recommendation.confidence * 100)}%
              </Badge>
            </div>
          </div>
          <p className="mt-2 text-sm text-muted-foreground">{recommendation.rationale}</p>
          {recommendation.requiresProfessionalConfirmation && (
            <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
              {recommendation.disclaimer}
            </p>
          )}
        </li>
      ))}
    </ul>
  );
}
