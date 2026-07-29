import { Link } from "@tanstack/react-router";
import { ArrowLeft, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { findNavItemByPath } from "@/config/navigation.config";

interface PagePlaceholderProps {
  url: string;
}

export function PagePlaceholder({ url }: PagePlaceholderProps) {
  const item = findNavItemByPath(url);

  return (
    <div className="flex flex-col gap-6">
      <header>
        <h1 className="font-serif text-3xl font-medium text-foreground">{item?.title ?? "Módulo"}</h1>
        <p className="mt-1 text-muted-foreground">{item?.description}</p>
      </header>

      <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-border bg-card/60 px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
          <Construction className="h-5 w-5" aria-hidden="true" />
        </span>
        <p className="font-medium text-foreground">Módulo em construção</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Este módulo será implementado nas próximas sprints, consumindo diretamente o Bella
          Knowledge Graph v3.0.
        </p>
        <Button
          asChild
          variant="outline"
          className="mt-2 focus-visible:ring-2 focus-visible:ring-marsala"
        >
          <Link to="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Link>
        </Button>
      </div>
    </div>
  );
}
