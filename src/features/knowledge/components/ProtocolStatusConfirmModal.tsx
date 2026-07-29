import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

import { useUpdateProtocolStatus } from "@/hooks/useProtocol";
import type { Protocol } from "@/services/protocol.service";
import { statusLabel, type ProtocolStatusAction } from "../types/protocol-lifecycle";

export interface ProtocolStatusConfirmModalProps {
  protocol: Protocol;
  action: ProtocolStatusAction | null;
  onClose: () => void;
}

export function ProtocolStatusConfirmModal({
  protocol,
  action,
  onClose,
}: ProtocolStatusConfirmModalProps) {
  const mutation = useUpdateProtocolStatus();
  const isPending = mutation.isPending;

  async function handleConfirm() {
    if (!action || isPending) return;
    try {
      await mutation.mutateAsync({ id: protocol.id, status: action.target });
      toast.success(`Protocolo movido para ${statusLabel(action.target)}.`);
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível alterar o status do protocolo.",
      );
    }
  }

  return (
    <AlertDialog
      open={action !== null}
      onOpenChange={(open) => {
        if (!open && !isPending) onClose();
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-serif text-xl font-medium">
            {action?.label} protocolo
          </AlertDialogTitle>
          <AlertDialogDescription>
            {action?.description} Protocolo: <strong>{protocol.name}</strong>.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              void handleConfirm();
            }}
          >
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
            Confirmar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
