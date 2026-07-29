import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProtocolStatus } from "@/services/protocol.service";

const STATUS_MAP: Record<ProtocolStatus, { label: string; className: string }> = {
  active: {
    label: "Ativo",
    className: "border-marsala/25 bg-marsala/10 text-marsala",
  },
  draft: {
    label: "Rascunho",
    className: "border-gold/35 bg-gold/10 text-foreground/80",
  },
  archived: {
    label: "Arquivado",
    className: "border-border bg-muted text-muted-foreground",
  },
  unknown: {
    label: "Não classificado",
    className: "border-dashed border-border bg-transparent text-muted-foreground",
  },
};

export interface ProtocolStatusBadgeProps {
  status: ProtocolStatus;
  className?: string;
}

export function ProtocolStatusBadge({ status, className }: ProtocolStatusBadgeProps) {
  const config = STATUS_MAP[status];

  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
