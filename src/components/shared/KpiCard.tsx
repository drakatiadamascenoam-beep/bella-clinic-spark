import type { LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export interface KpiCardProps {
  label: string;
  value: number | null;
  icon: LucideIcon;
  /** Texto auxiliar exibido abaixo do valor */
  hint?: string;
  /** Mensagem exibida quando a fonte de dados ainda não está disponível */
  unavailableLabel?: string;
  isLoading?: boolean;
  className?: string;
}

export function KpiCard({
  label,
  value,
  icon: Icon,
  hint,
  unavailableLabel = "Fonte indisponível",
  isLoading = false,
  className,
}: KpiCardProps) {
  const unavailable = value === null;

  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-5 shadow-soft transition-colors",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-muted text-foreground/70">
          <Icon className="h-4 w-4" aria-hidden="true" />
        </span>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <Skeleton className="h-9 w-20" />
        ) : unavailable ? (
          <p className="font-serif text-2xl font-medium text-muted-foreground">—</p>
        ) : (
          <p className="font-serif text-3xl font-medium text-foreground tabular-nums">
            {value.toLocaleString("pt-BR")}
          </p>
        )}
      </div>

      {isLoading ? (
        <Skeleton className="mt-2 h-3 w-32" />
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">
          {unavailable ? unavailableLabel : hint}
        </p>
      )}
    </div>
  );
}
