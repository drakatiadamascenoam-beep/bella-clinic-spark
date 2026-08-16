import { createFileRoute } from "@tanstack/react-router";
import { DashboardPage } from "@/features/dashboard";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Cockpit Executivo — Bella IA" },
      {
        name: "description",
        content:
          "Indicadores clínico-operacionais da clínica Esthetic Center: ocupação, absenteísmo, atendimentos e desempenho da equipe.",
      },
      { property: "og:title", content: "Cockpit Executivo — Bella IA" },
      {
        property: "og:description",
        content: "Cockpit de indicadores clínico-financeiros da Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DashboardPage,
});
