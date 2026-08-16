import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { ClinicalValidationResult } from "../types/ai.types";

export interface ClinicalValidationBadgeProps {
  result: ClinicalValidationResult | null;
  isPending?: boolean;
  isError?: boolean;
}

/** Representação puramente presentacional do resultado da validação de evolução clínica. */
export function ClinicalValidationBadge({
  result,
  isPending = false,
  isError = false,
}: ClinicalValidationBadgeProps) {
  if (isPending) {
    return (
      <Badge variant="secondary" aria-busy="true">
        Validando evolução…
      </Badge>
    );
  }

  if (isError) {
    return (
      <Badge variant="destructive" role="alert">
        Validação indisponível
      </Badge>
    );
  }

  if (!result) {
    return <Badge variant="outline">Sem validação</Badge>;
  }

  const hasIssues = result.issues.length > 0;
  const label = hasIssues
    ? `Atenção · ${result.score}%`
    : `Evolução consistente · ${result.score}%`;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Detalhes da validação clínica. ${label}`}
          className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Badge variant={hasIssues ? "secondary" : "default"}>{label}</Badge>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 text-sm">
        <p className="font-medium text-foreground">
          Fonte: {result.validationSource === "LLM" ? "modelo generativo" : "regras locais"} ·
          Confiança {Math.round(result.confidence * 100)}%
        </p>

        {hasIssues && (
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Pontos de atenção
            </p>
            <ul className="mt-1 list-disc pl-4 text-sm text-muted-foreground">
              {result.issues.map((issue) => (
                <li key={issue}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {result.recommendations.length > 0 && (
          <div className="mt-3">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Recomendações
            </p>
            <ul className="mt-1 list-disc pl-4 text-sm text-muted-foreground">
              {result.recommendations.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <p className="mt-3 border-t border-border pt-3 text-xs text-muted-foreground">
          {result.disclaimer}
        </p>
      </PopoverContent>
    </Popover>
  );
}
