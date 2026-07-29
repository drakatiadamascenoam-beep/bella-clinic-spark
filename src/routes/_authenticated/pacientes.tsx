import { createFileRoute } from "@tanstack/react-router";
import { PacientesPage } from "@/features/patients/pages/PacientesPage";

export const Route = createFileRoute("/_authenticated/pacientes")({
  head: () => ({
    meta: [
      { title: "Gestão de Pacientes — Bella IA" },
      {
        name: "description",
        content:
          "Cadastro, busca unificada e Raio-X de prontuário dos pacientes da clínica Esthetic Center.",
      },
      { property: "og:title", content: "Gestão de Pacientes — Bella IA" },
      {
        property: "og:description",
        content: "Cadastro, consulta e prontuário de pacientes na Bella Clinic Platform.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PacientesPage,
});
