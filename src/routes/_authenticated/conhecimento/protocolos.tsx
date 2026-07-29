import { createFileRoute } from "@tanstack/react-router";
import { ProtocolosPage } from "@/features/knowledge/pages/ProtocolosPage";

export const Route = createFileRoute("/_authenticated/conhecimento/protocolos")({
  head: () => ({
    meta: [
      { title: "Protocolos Mestres — Bella IA" },
      {
        name: "description",
        content:
          "Consulta aos protocolos clínicos padronizados da clínica Esthetic Center na Bella IA.",
      },
      { property: "og:title", content: "Protocolos Mestres — Bella IA" },
      {
        property: "og:description",
        content: "Central do Conhecimento: protocolos clínicos padronizados da Esthetic Center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProtocolosPage,
});
