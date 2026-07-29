import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const Route = createFileRoute("/_authenticated/pacientes")({
  head: () => ({
    meta: [
      { title: "Pacientes — Bella IA" },
      { name: "description", content: "Pacientes na Bella Clinic Platform da clínica Esthetic Center." },
      { property: "og:title", content: "Pacientes — Bella IA" },
      { property: "og:description", content: "Pacientes na Bella Clinic Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PagePlaceholder url="/pacientes" />,
});
