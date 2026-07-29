import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_authenticated/conhecimento")({
  head: () => ({
    meta: [
      { title: "Central do Conhecimento — Bella IA" },
      { name: "description", content: "Base de conhecimento clínico da clínica Esthetic Center." },
      { property: "og:title", content: "Central do Conhecimento — Bella IA" },
      { property: "og:description", content: "Base de conhecimento clínico da Bella IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <Outlet />,
});
