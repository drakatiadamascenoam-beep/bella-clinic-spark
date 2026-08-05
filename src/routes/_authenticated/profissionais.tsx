import { createFileRoute } from "@tanstack/react-router";
import { ProfissionaisPage } from "@/features/professionals/pages/ProfissionaisPage";

export const Route = createFileRoute("/_authenticated/profissionais")({
  head: () => ({
    meta: [
      { title: "Gestão de Equipe & Profissionais — Bella IA" },
      {
        name: "description",
        content:
          "Cadastro de profissionais, conselhos, papéis clínicos e jornada de atendimento da clínica Esthetic Center.",
      },
      { property: "og:title", content: "Gestão de Equipe & Profissionais — Bella IA" },
      {
        property: "og:description",
        content: "Equipe clínica, especialidades e escala na Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfissionaisPage,
});
