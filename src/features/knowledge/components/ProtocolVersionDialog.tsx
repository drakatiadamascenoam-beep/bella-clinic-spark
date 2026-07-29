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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

import { useCreateProtocolVersion } from "@/hooks/useProtocol";
import type { Protocol } from "@/services/protocol.service";
import {
  nextVersion,
  PROTOCOL_VERSION_TYPES,
  PROTOCOL_VERSION_TYPE_LABELS,
  protocolVersionSchema,
  type ProtocolVersionValues,
} from "../types/protocol-lifecycle";

export interface ProtocolVersionDialogProps {
  protocol: Protocol;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DEFAULT_VALUES: ProtocolVersionValues = { versionType: "PATCH", changes: "" };

export function ProtocolVersionDialog({
  protocol,
  open,
  onOpenChange,
}: ProtocolVersionDialogProps) {
  const mutation = useCreateProtocolVersion();
  const isPending = mutation.isPending;

  const form = useForm<ProtocolVersionValues>({
    resolver: zodResolver(protocolVersionSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { reset } = form;
  useEffect(() => {
    if (open) reset(DEFAULT_VALUES);
  }, [open, reset]);

  const selectedType = form.watch("versionType");
  const preview = nextVersion(protocol.version, selectedType);

  async function onSubmit(values: ProtocolVersionValues) {
    if (isPending) return;
    try {
      const result = await mutation.mutateAsync({
        id: protocol.id,
        versionType: values.versionType,
        changes: values.changes,
      });
      toast.success(`Versão ${result.protocol.version ?? preview} registrada.`, {
        description: result.changeLogPersisted
          ? undefined
          : "O log de alterações não é armazenado: o schema atual não possui histórico de versões.",
      });
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível registrar a nova versão.",
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
          <DialogTitle className="font-serif text-xl font-medium">Nova versão</DialogTitle>
          <DialogDescription>
            Versão vigente: {protocol.version ?? "não informada"} → <strong>{preview}</strong>
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="versionType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de incremento</FormLabel>
                  <FormControl>
                    <RadioGroup
                      value={field.value}
                      onValueChange={field.onChange}
                      className="gap-2"
                    >
                      {PROTOCOL_VERSION_TYPES.map((type) => (
                        <label
                          key={type}
                          className="flex cursor-pointer items-center gap-3 rounded-xl border border-border p-3 text-sm"
                        >
                          <RadioGroupItem value={type} className="focus-visible:ring-marsala" />
                          <span>
                            <span className="font-medium text-foreground">{type}</span>{" "}
                            <span className="text-muted-foreground">
                              — {PROTOCOL_VERSION_TYPE_LABELS[type]}
                            </span>
                          </span>
                        </label>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="changes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Log de alterações</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder="Descreva o que mudou nesta versão"
                      className="focus-visible:ring-2 focus-visible:ring-marsala"
                    />
                  </FormControl>
                  <FormDescription>
                    O schema atual não possui histórico de versões; apenas a versão vigente é
                    persistida.
                  </FormDescription>
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
                Registrar versão
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
