import { Link } from "@tanstack/react-router";
import { CalendarPlus, FilePlus2, UserPlus, BookOpenText } from "lucide-react";
import { Button } from "@/components/ui/button";

const actions = [
  { title: "Novo Paciente", to: "/pacientes", icon: UserPlus },
  { title: "Novo Atendimento", to: "/atendimentos", icon: FilePlus2 },
  { title: "Agendar", to: "/agenda", icon: CalendarPlus },
  { title: "Conhecimento", to: "/conhecimento", icon: BookOpenText },
] as const;

export function QuickActions() {
  return (
    <section
      aria-labelledby="quick-actions-title"
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <h2 id="quick-actions-title" className="font-serif text-lg font-medium text-foreground">
        Ações Rápidas
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">Atalhos para as tarefas mais frequentes.</p>

      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {actions.map((action) => (
          <Button
            key={action.title}
            asChild
            variant="outline"
            className="h-auto justify-start gap-3 rounded-xl px-4 py-3 focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <Link to={action.to}>
              <action.icon className="h-4 w-4 text-marsala" />
              <span className="text-sm font-medium">{action.title}</span>
            </Link>
          </Button>
        ))}
      </div>
    </section>
  );
}
