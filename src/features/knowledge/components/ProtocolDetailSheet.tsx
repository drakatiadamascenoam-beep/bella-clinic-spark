import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { ProtocolActionsMenu } from "./ProtocolActionsMenu";
import { ProtocolStatusBadge } from "./ProtocolStatusBadge";
import { useProtocol } from "@/hooks/useProtocol";
import type { Protocol } from "@/services/protocol.service";

export interface ProtocolDetailSheetProps {
  protocol: Protocol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (protocol: Protocol) => void;
}

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground/90">{value ?? "Não informado"}</p>
    </div>
  );
}

export function ProtocolDetailSheet({
  protocol,
  open,
  onOpenChange,
  onEdit,
}: ProtocolDetailSheetProps) {
  const { data, isFetching } = useProtocol(open && protocol ? protocol.id : null);
  const current = data ?? protocol;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {current?.name ?? "Protocolo"}
          </SheetTitle>
          <SheetDescription>
            {current?.code
              ? `Código ${current.code}`
              : "Detalhes do protocolo mestre registrado no Bella Knowledge Graph."}
          </SheetDescription>
          {current && (
            <div className="flex items-center justify-between gap-3">
              <ProtocolStatusBadge status={current.status} className="w-fit" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">
                  Versão vigente: {current.version ?? "não informada"}
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(current)}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                  Editar
                </Button>
                <ProtocolActionsMenu protocol={current} onEdit={onEdit} />
              </div>
            </div>
          )}
        </SheetHeader>

        <Separator className="my-5" />

        {isFetching && !data ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        ) : current ? (
          <div className="space-y-5">
            <Field label="Categoria" value={current.category} />
            <Field label="Versão" value={current.version} />
            <Field label="Resumo" value={current.summary} />
            <Field label="Indicações" value={current.indications} />
            <Field label="Contraindicações" value={current.contraindications} />
            <Field label="Última atualização" value={current.updatedAt} />

            <div className="rounded-xl border border-dashed border-border p-4">
              <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
                Histórico de versões
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                O schema atual do Bella Knowledge Graph v3.0 não expõe histórico de versões. Esta
                área será preenchida automaticamente quando a fonte estiver disponível.
              </p>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os detalhes deste protocolo.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
