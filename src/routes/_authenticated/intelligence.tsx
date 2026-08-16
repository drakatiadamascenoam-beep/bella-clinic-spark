import { createFileRoute } from "@tanstack/react-router";
import { BellaAIPage } from "@/features/intelligence";

export const Route = createFileRoute("/_authenticated/intelligence")({
  head: () => ({
    meta: [
      { title: "Bella Intelligence — Apoio à Decisão Clínica" },
      {
        name: "description",
        content:
          "Insights operacionais, recomendações de protocolos e validação de evolução clínica com apoio da Bella IA.",
      },
      { property: "og:title", content: "Bella Intelligence — Apoio à Decisão Clínica" },
      {
        property: "og:description",
        content: "Camada de inteligência clínica e operacional da Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BellaAIPage,
});
