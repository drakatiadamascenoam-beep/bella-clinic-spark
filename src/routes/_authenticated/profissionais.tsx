import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const Route = createFileRoute("/_authenticated/profissionais")({
  head: () => ({
    meta: [
      { title: "Profissionais — Bella IA" },
      { name: "description", content: "Profissionais na Bella Clinic Platform da clínica Esthetic Center." },
      { property: "og:title", content: "Profissionais — Bella IA" },
      { property: "og:description", content: "Profissionais na Bella Clinic Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PagePlaceholder url="/profissionais" />,
});
