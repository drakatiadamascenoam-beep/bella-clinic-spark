import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface ProfessionalStatusBadgeProps {
  ativo: boolean;
  className?: string;
}

/** Indicador visual de status do profissional (ativo/inativo). */
export function ProfessionalStatusBadge({ ativo, className }: ProfessionalStatusBadgeProps) {
  return (
    <Badge
      variant="outline"
      className={cn(
        "font-medium",
        ativo
          ? "border-emerald-600/30 bg-emerald-600/10 text-emerald-700"
          : "border-border bg-muted text-muted-foreground",
        className,
      )}
    >
      {ativo ? "Ativo" : "Inativo"}
    </Badge>
  );
}
