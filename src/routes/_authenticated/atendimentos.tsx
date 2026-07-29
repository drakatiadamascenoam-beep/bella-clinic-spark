import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const Route = createFileRoute("/_authenticated/atendimentos")({
  head: () => ({
    meta: [
      { title: "Atendimento Clínico — Bella IA" },
      { name: "description", content: "Atendimento Clínico na Bella Clinic Platform da clínica Esthetic Center." },
      { property: "og:title", content: "Atendimento Clínico — Bella IA" },
      { property: "og:description", content: "Atendimento Clínico na Bella Clinic Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PagePlaceholder url="/atendimentos" />,
});
