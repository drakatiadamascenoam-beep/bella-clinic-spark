import { createFileRoute } from "@tanstack/react-router";
import { AgendaPage } from "@/features/schedule/pages/AgendaPage";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda Clínica — Bella IA" },
      {
        name: "description",
        content:
          "Agendamentos, confirmações, conflitos de horário e encaminhamento ao atendimento da clínica Esthetic Center.",
      },
      { property: "og:title", content: "Agenda Clínica — Bella IA" },
      {
        property: "og:description",
        content: "Gestão de compromissos e status da agenda na Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AgendaPage,
});
