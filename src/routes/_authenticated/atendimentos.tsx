import { createFileRoute } from "@tanstack/react-router";
import { AtendimentosPage } from "@/features/attendance/pages/AtendimentosPage";

export const Route = createFileRoute("/_authenticated/atendimentos")({
  head: () => ({
    meta: [
      { title: "Atendimento Clínico — Bella IA" },
      {
        name: "description",
        content:
          "Sessões clínicas, evolução de prontuário e protocolos aplicados na clínica Esthetic Center.",
      },
      { property: "og:title", content: "Atendimento Clínico — Bella IA" },
      {
        property: "og:description",
        content: "Atendimento clínico e evolução de prontuário na Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AtendimentosPage,
});

