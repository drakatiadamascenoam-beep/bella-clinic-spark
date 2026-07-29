import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Bella IA — Esthetic Center" },
      { name: "description", content: "Plataforma corporativa da Esthetic Center." },
      { property: "og:title", content: "Bella IA — Esthetic Center" },
      { property: "og:description", content: "Plataforma corporativa da Esthetic Center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-creme px-4">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-marsala text-marsala-foreground shadow-soft">
          <Sparkles className="h-8 w-8" />
        </div>
        <h1 className="mt-6 font-serif text-4xl font-medium tracking-tight text-foreground md:text-5xl">
          Bella IA
        </h1>
        <p className="mt-3 max-w-md text-lg text-muted-foreground">
          Plataforma inteligente da Esthetic Center para gestão clínica premium.
        </p>
        <div className="mt-8 flex gap-3">
          <Button
            asChild
            className="rounded-full bg-marsala px-6 text-marsala-foreground hover:bg-marsala-medium"
          >
            <Link to="/auth">Acessar plataforma</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
