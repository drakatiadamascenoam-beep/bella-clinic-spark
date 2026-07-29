import { createFileRoute } from "@tanstack/react-router";
import { AlertCircle, ClipboardList, Stethoscope, UserCog, Users } from "lucide-react";

import { useDashboard } from "@/hooks/useDashboard";
import { KpiCard } from "@/components/shared/KpiCard";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { RecentEncountersTable } from "@/components/dashboard/recent-encounters-table";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bella IA" },
      { name: "description", content: "Visão geral da operação da clínica Esthetic Center." },
      { property: "og:title", content: "Dashboard — Bella IA" },
      {
        property: "og:description",
        content: "Indicadores, ações rápidas e atendimentos recentes da Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const { data, isPending, isError } = useDashboard();

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-3xl font-medium text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">
          Visão geral da operação da clínica Esthetic Center.
        </p>
      </header>

      {isError && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl border border-destructive/30 bg-destructive/5 p-4"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" aria-hidden="true" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Não foi possível carregar os indicadores
            </p>
            <p className="text-sm text-muted-foreground">
              Verifique sua conexão e tente novamente em alguns instantes.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total de Pacientes"
          value={data?.totalPatients.value ?? null}
          icon={Users}
          hint="Pacientes cadastrados"
          isLoading={isPending}
        />
        <KpiCard
          label="Atendimentos do mês"
          value={data?.monthlyEncounters.value ?? null}
          icon={Stethoscope}
          hint="Registros no mês corrente"
          isLoading={isPending}
        />
        <KpiCard
          label="Protocolos Ativos"
          value={data?.activeProtocols.value ?? null}
          icon={ClipboardList}
          hint="Protocolos clínicos em uso"
          isLoading={isPending}
        />
        <KpiCard
          label="Profissionais Ativos"
          value={data?.activeProfessionals.value ?? null}
          icon={UserCog}
          hint="Equipe clínica ativa"
          isLoading={isPending}
        />
      </div>

      {!isPending && data?.sourcesUnavailable && (
        <p className="text-sm text-muted-foreground">
          As fontes de dados do Bella Knowledge Graph ainda não estão disponíveis nesta instância.
          Os indicadores serão preenchidos automaticamente assim que o schema for publicado.
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <QuickActions />
        </div>
        <div className="lg:col-span-2">
          <RecentEncountersTable
            encounters={data?.recentEncounters ?? []}
            isLoading={isPending}
          />
        </div>
      </div>
    </div>
  );
}
