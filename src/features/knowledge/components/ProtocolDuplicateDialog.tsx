import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import { useDuplicateProtocol } from "@/hooks/useProtocol";
import type { Protocol } from "@/services/protocol.service";
import {
  protocolDuplicateSchema,
  suggestDuplicateCode,
  suggestDuplicateName,
  type ProtocolDuplicateValues,
} from "../types/protocol-lifecycle";

export interface ProtocolDuplicateDialogProps {
  protocol: Protocol;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProtocolDuplicateDialog({
  protocol,
  open,
  onOpenChange,
}: ProtocolDuplicateDialogProps) {
  const mutation = useDuplicateProtocol();
  const isPending = mutation.isPending;

  const form = useForm<ProtocolDuplicateValues>({
    resolver: zodResolver(protocolDuplicateSchema),
    defaultValues: {
      name: suggestDuplicateName(protocol.name),
      code: suggestDuplicateCode(protocol.code),
    },
  });

  const { reset } = form;
  useEffect(() => {
    if (!open) return;
    reset({
      name: suggestDuplicateName(protocol.name),
      code: suggestDuplicateCode(protocol.code),
    });
  }, [open, protocol, reset]);

  async function onSubmit(values: ProtocolDuplicateValues) {
    if (isPending) return;
    try {
      const created = await mutation.mutateAsync({
        id: protocol.id,
        name: values.name,
        code: values.code.length > 0 ? values.code : null,
      });
      toast.success(`Protocolo duplicado como rascunho: ${created.name}.`);
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível duplicar o protocolo.",
      );
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next && isPending) return;
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-serif text-xl font-medium">Duplicar protocolo</DialogTitle>
          <DialogDescription>
            A cópia é criada como rascunho, preservando conteúdo clínico e categoria.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome da cópia</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="focus-visible:ring-2 focus-visible:ring-marsala"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Código sugerido</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      className="focus-visible:ring-2 focus-visible:ring-marsala"
                    />
                  </FormControl>
                  <FormDescription>Deixe em branco para não atribuir código.</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="ghost"
                disabled={isPending}
                onClick={() => onOpenChange(false)}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Duplicar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
