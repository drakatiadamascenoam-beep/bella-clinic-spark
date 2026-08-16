import { useMemo, useState } from "react";
import { MessageSquare, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useDashboard } from "@/hooks/useDashboard";
import { useProtocols } from "@/hooks/useProtocol";

import { AIStatusBadge } from "../components/AIStatusBadge";
import { AIInsightBanner } from "../components/AIInsightBanner";
import { BellaAIAssistantSheet } from "../components/BellaAIAssistantSheet";
import { ClinicalRecommendationCard } from "../components/ClinicalRecommendationCard";
import { ClinicalValidationBadge } from "../components/ClinicalValidationBadge";
import { useAIProviderStatus } from "../hooks/useAIProviderStatus";
import { useProtocolRecommendations } from "../hooks/useProtocolRecommendations";
import { useValidateClinicalText } from "../hooks/useValidateClinicalText";
import type { MasterProtocol, MetricPoint } from "../types/intelligence-io.types";

const PROTOCOL_QUERY = { search: "", status: "active", category: "all", page: 1 } as const;

function toKeywords(name: string, category: string | null): readonly string[] {
  return [name, category ?? ""]
    .join(" ")
    .split(/[\s,/-]+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 3);
}

export function BellaAIPage() {
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [complaint, setComplaint] = useState("");
  const [evolutionText, setEvolutionText] = useState("");

  const providerStatus = useAIProviderStatus();
  const dashboard = useDashboard();
  const protocols = useProtocols(PROTOCOL_QUERY);
  const recommendations = useProtocolRecommendations();
  const validation = useValidateClinicalText();

  const activeStatus = useMemo(() => {
    const list = providerStatus.data ?? [];
    return list.find((entry) => entry.available) ?? list[0] ?? null;
  }, [providerStatus.data]);

  const metrics = useMemo<readonly MetricPoint[]>(() => {
    const data = dashboard.data;
    if (!data || data.sourcesUnavailable) return [];
    const points: MetricPoint[] = [];
    if (data.monthlyEncounters.value !== null) {
      points.push({
        metric: "Atendimentos no mês",
        category: "Operação",
        value: data.monthlyEncounters.value,
        threshold: 0,
        higherIsWorse: false,
      });
    }
    if (data.activeProfessionals.value !== null) {
      points.push({
        metric: "Profissionais ativos",
        category: "Equipe",
        value: data.activeProfessionals.value,
        threshold: 1,
        higherIsWorse: false,
      });
    }
    if (data.activeProtocols.value !== null) {
      points.push({
        metric: "Protocolos ativos",
        category: "Conhecimento",
        value: data.activeProtocols.value,
        threshold: 1,
        higherIsWorse: false,
      });
    }
    return points;
  }, [dashboard.data]);

  const masterProtocols = useMemo<readonly MasterProtocol[]>(
    () =>
      (protocols.data?.items ?? []).map((protocol) => ({
        id: protocol.id,
        name: protocol.name,
        keywords: toKeywords(protocol.name, protocol.category),
      })),
    [protocols.data],
  );

  function handleRecommend() {
    if (recommendations.isPending) return;
    const trimmed = complaint.trim();
    if (trimmed.length === 0) return;
    recommendations.mutate({ history: [], complaint: trimmed, protocols: masterProtocols });
  }

  function handleValidate() {
    if (validation.isPending) return;
    const trimmed = evolutionText.trim();
    if (trimmed.length === 0) return;
    validation.mutate(trimmed);
  }

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-medium text-foreground">Bella Intelligence</h1>
          <p className="mt-1 max-w-2xl text-muted-foreground">
            Camada de apoio à decisão clínica e operacional da Esthetic Center. Todas as saídas são
            sugestões auditáveis e exigem confirmação profissional.
          </p>
        </div>
        <AIStatusBadge
          status={activeStatus}
          mode={activeStatus?.available ? "LLM" : "LOCAL_RULES"}
          isLoading={providerStatus.isPending}
        />
      </header>

      {providerStatus.isError && (
        <p role="alert" className="text-sm text-destructive">
          Não foi possível verificar os provedores de IA. A plataforma segue operando com regras
          locais determinísticas.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <section aria-labelledby="insights-title" className="flex flex-col gap-3">
            <h2 id="insights-title" className="font-serif text-xl font-medium text-foreground">
              Insights operacionais
            </h2>
            <AIInsightBanner metrics={metrics} />
          </section>

          <section aria-labelledby="assistant-title" className="flex flex-col gap-3">
            <h2 id="assistant-title" className="font-serif text-xl font-medium text-foreground">
              Interação com a Bella
            </h2>
            <div className="rounded-lg border border-border bg-card p-4">
              <p className="text-sm text-muted-foreground">
                O assistente clínico responde com base em contexto estruturado de paciente,
                atendimento, profissional e protocolos. Abra o painel para iniciar uma interação.
              </p>
              <Button
                type="button"
                onClick={() => setAssistantOpen(true)}
                className="mt-4 focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <MessageSquare className="mr-2 h-4 w-4" aria-hidden="true" />
                Abrir assistente
              </Button>
            </div>
          </section>
        </div>

        <aside className="flex flex-col gap-6">
          <section aria-labelledby="recommendations-title" className="flex flex-col gap-3">
            <h2
              id="recommendations-title"
              className="font-serif text-xl font-medium text-foreground"
            >
              Recomendações clínicas
            </h2>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <Label htmlFor="complaint">Queixa clínica</Label>
              <Textarea
                id="complaint"
                rows={3}
                value={complaint}
                onChange={(event) => setComplaint(event.target.value)}
                placeholder="Descreva a queixa principal do paciente"
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              />
              <Button
                type="button"
                variant="outline"
                onClick={handleRecommend}
                disabled={recommendations.isPending || complaint.trim().length === 0}
                className="self-start focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <Sparkles className="mr-2 h-4 w-4" aria-hidden="true" />
                Sugerir protocolos
              </Button>
              {protocols.data?.sourceUnavailable && (
                <p className="text-xs text-muted-foreground">
                  Fonte de protocolos indisponível no Bella Knowledge Graph.
                </p>
              )}
            </div>
            <ClinicalRecommendationCard
              recommendations={recommendations.data?.data ?? []}
              isPending={recommendations.isPending}
              isError={recommendations.isError}
              errorMessage={
                recommendations.error instanceof Error ? recommendations.error.message : null
              }
              hasResult={recommendations.isSuccess}
            />
          </section>

          <Separator />

          <section aria-labelledby="validation-title" className="flex flex-col gap-3">
            <h2 id="validation-title" className="font-serif text-xl font-medium text-foreground">
              Validação de evolução
            </h2>
            <div className="flex flex-col gap-2 rounded-lg border border-border bg-card p-4">
              <Label htmlFor="evolution">Texto da evolução clínica</Label>
              <Textarea
                id="evolution"
                rows={4}
                value={evolutionText}
                onChange={(event) => setEvolutionText(event.target.value)}
                placeholder="Cole o texto da evolução para verificar consistência"
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              />
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleValidate}
                  disabled={validation.isPending || evolutionText.trim().length === 0}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  Validar evolução
                </Button>
                <ClinicalValidationBadge
                  result={validation.data?.data ?? null}
                  isPending={validation.isPending}
                  isError={validation.isError}
                />
              </div>
            </div>
          </section>
        </aside>
      </div>

      <BellaAIAssistantSheet open={assistantOpen} onOpenChange={setAssistantOpen} context={null} />
    </div>
  );
}
