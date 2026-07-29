import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Bella IA" },
      { name: "description", content: "Visão geral da Bella Clinic Platform." },
      { property: "og:title", content: "Dashboard — Bella IA" },
      { property: "og:description", content: "Visão geral da Bella Clinic Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-serif text-3xl font-medium text-foreground">Dashboard</h1>
        <p className="mt-1 text-muted-foreground">Área principal da plataforma. Funcionalidades em desenvolvimento.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
          <h2 className="font-serif text-lg font-medium">Bem-vinda</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            A estrutura da Bella Clinic Platform está pronta. As funcionalidades clínicas serão
            implementadas nas próximas sprints.
          </p>
        </div>
      </div>
    </div>
  );
}
