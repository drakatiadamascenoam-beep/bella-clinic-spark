import { useState } from "react";
import { Archive, Copy, GitBranch, MoreHorizontal, Pencil, Send, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { Protocol } from "@/services/protocol.service";
import { useUpdateProtocolStatus } from "@/hooks/useProtocol";
import { toast } from "sonner";
import {
  availableStatusActions,
  statusLabel,
  type ProtocolLifecycleStatus,
  type ProtocolStatusAction,
} from "../types/protocol-lifecycle";
import { ProtocolStatusConfirmModal } from "./ProtocolStatusConfirmModal";
import { ProtocolDuplicateDialog } from "./ProtocolDuplicateDialog";
import { ProtocolVersionDialog } from "./ProtocolVersionDialog";

export interface ProtocolActionsMenuProps {
  protocol: Protocol;
  onEdit: (protocol: Protocol) => void;
  /** Alinhamento do menu; usado na tabela para não estourar a largura. */
  align?: "start" | "end";
}

const STATUS_ICONS: Record<ProtocolLifecycleStatus, typeof Upload> = {
  active: Upload,
  draft: Send,
  archived: Archive,
};

export function ProtocolActionsMenu({
  protocol,
  onEdit,
  align = "end",
}: ProtocolActionsMenuProps) {
  const [statusAction, setStatusAction] = useState<ProtocolStatusAction | null>(null);
  const [duplicateOpen, setDuplicateOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);

  const statusMutation = useUpdateProtocolStatus();
  const actions = availableStatusActions(protocol.status);

  async function runDirectTransition(action: ProtocolStatusAction) {
    if (statusMutation.isPending) return;
    try {
      await statusMutation.mutateAsync({ id: protocol.id, status: action.target });
      toast.success(`Protocolo movido para ${statusLabel(action.target)}.`);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível alterar o status do protocolo.",
      );
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Ações do protocolo ${protocol.name}`}
            onClick={(event) => event.stopPropagation()}
            className="h-8 w-8 focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align={align}
          className="w-56"
          onClick={(event) => event.stopPropagation()}
        >
          <DropdownMenuLabel>Ciclo de vida</DropdownMenuLabel>
          <DropdownMenuItem onSelect={() => onEdit(protocol)}>
            <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
            Editar
          </DropdownMenuItem>

          {actions.map((action) => {
            const Icon = STATUS_ICONS[action.target];
            return (
              <DropdownMenuItem
                key={action.target}
                disabled={statusMutation.isPending}
                onSelect={() => {
                  if (action.sensitive) {
                    setStatusAction(action);
                    return;
                  }
                  void runDirectTransition(action);
                }}
              >
                <Icon className="mr-2 h-4 w-4" aria-hidden="true" />
                {action.label}
              </DropdownMenuItem>
            );
          })}

          <DropdownMenuSeparator />
          <DropdownMenuItem onSelect={() => setVersionOpen(true)}>
            <GitBranch className="mr-2 h-4 w-4" aria-hidden="true" />
            Nova versão
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setDuplicateOpen(true)}>
            <Copy className="mr-2 h-4 w-4" aria-hidden="true" />
            Duplicar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ProtocolStatusConfirmModal
        protocol={protocol}
        action={statusAction}
        onClose={() => setStatusAction(null)}
      />
      <ProtocolDuplicateDialog
        protocol={protocol}
        open={duplicateOpen}
        onOpenChange={setDuplicateOpen}
      />
      <ProtocolVersionDialog
        protocol={protocol}
        open={versionOpen}
        onOpenChange={setVersionOpen}
      />
    </>
  );
}
