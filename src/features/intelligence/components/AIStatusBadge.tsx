import { Badge } from "@/components/ui/badge";
import type { AIProviderStatus } from "../types/ai.types";

export interface AIStatusBadgeProps {
  status: AIProviderStatus | null;
  mode: "LLM" | "LOCAL_RULES";
  isLoading?: boolean;
}

/** Badge de observabilidade: status, provider, modelo, versão, modo e última verificação. */
export function AIStatusBadge({ status, mode, isLoading = false }: AIStatusBadgeProps) {
  const tone = isLoading ? "bg-muted-foreground" : status?.available ? "bg-emerald-600" : "bg-destructive";
  const toneLabel = isLoading ? "Verificando" : status?.available ? "Disponível" : "Indisponível";
  const checked = status ? new Date(status.lastCheckedAt).toLocaleTimeString("pt-BR") : "—";

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-border bg-card px-3 py-2 shadow-soft">
      <span className={`h-2 w-2 rounded-full ${tone}`} role="img" aria-label={toneLabel} />
      <span className="text-sm font-medium text-foreground">{status?.name ?? "Indisponível"}</span>
      <Badge variant="secondary">{status?.model ?? "—"}</Badge>
      <Badge variant="outline">v{status?.providerVersion ?? "—"}</Badge>
      <Badge variant={mode === "LLM" ? "default" : "secondary"}>
        {mode === "LLM" ? "LLM" : "Regras locais"}
      </Badge>
      <span className="text-xs text-muted-foreground">Última verificação: {checked}</span>
    </div>
  );
}
