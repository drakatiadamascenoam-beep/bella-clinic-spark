import { createFileRoute } from "@tanstack/react-router";
import { PagePlaceholder } from "@/components/shared/page-placeholder";

export const Route = createFileRoute("/_authenticated/agenda")({
  head: () => ({
    meta: [
      { title: "Agenda — Bella IA" },
      { name: "description", content: "Agenda na Bella Clinic Platform da clínica Esthetic Center." },
      { property: "og:title", content: "Agenda — Bella IA" },
      { property: "og:description", content: "Agenda na Bella Clinic Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <PagePlaceholder url="/agenda" />,
});
