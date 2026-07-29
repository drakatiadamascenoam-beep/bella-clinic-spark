import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ClipboardList } from "lucide-react";

export const Route = createFileRoute("/_authenticated/conhecimento/")({
  head: () => ({
    meta: [
      { title: "Central do Conhecimento — Bella IA" },
      {
        name: "description",
        content: "Base de conhecimento clínico da clínica Esthetic Center na Bella IA.",
      },
      { property: "og:title", content: "Central do Conhecimento — Bella IA" },
      {
        property: "og:description",
        content: "Protocolos mestres e base de conhecimento clínico da Esthetic Center.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConhecimentoIndexPage,
});

function ConhecimentoIndexPage() {
  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-3xl font-medium text-foreground">
          Central do Conhecimento
        </h1>
        <p className="mt-1 text-muted-foreground">
          Base de conhecimento clínico da Bella IA.
        </p>
      </header>

      <Link
        to="/conhecimento/protocolos"
        className="group flex items-start gap-4 rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors hover:border-marsala/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
          <ClipboardList className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="flex-1">
          <span className="block font-medium text-foreground">Protocolos Mestres</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Protocolos clínicos padronizados, com filtros por status e categoria.
          </span>
        </span>
        <ArrowRight
          className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        />
      </Link>
    </div>
  );
}
