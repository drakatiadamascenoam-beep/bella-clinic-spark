import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

import { useCreateProtocol, useProtocol, useUpdateProtocol } from "@/hooks/useProtocol";
import type { Protocol } from "@/services/protocol.service";
import {
  PROTOCOL_FORM_DEFAULTS,
  PROTOCOL_FORM_STATUS,
  PROTOCOL_STATUS_LABELS,
  protocolFormSchema,
  type ProtocolFormValues,
} from "../types/protocol-form";

export interface ProtocolFormSheetProps {
  /** null → modo criação; Protocol → modo edição. */
  protocol: Protocol | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toFormValues(protocol: Protocol): ProtocolFormValues {
  return {
    name: protocol.name,
    code: protocol.code ?? "",
    category: protocol.category ?? "",
    version: protocol.version ?? "",
    status: protocol.status === "unknown" ? "draft" : protocol.status,
    summary: protocol.summary ?? "",
    indications: protocol.indications ?? "",
    contraindications: protocol.contraindications ?? "",
  };
}

export function ProtocolFormSheet({ protocol, open, onOpenChange }: ProtocolFormSheetProps) {
  const isEdit = protocol !== null;
  const { data: loaded, isFetching } = useProtocol(open && protocol ? protocol.id : null);
  const current = loaded ?? protocol;

  const createMutation = useCreateProtocol();
  const updateMutation = useUpdateProtocol();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ProtocolFormValues>({
    resolver: zodResolver(protocolFormSchema),
    defaultValues: PROTOCOL_FORM_DEFAULTS,
    mode: "onBlur",
  });

  const { reset } = form;
  useEffect(() => {
    if (!open) return;
    reset(current ? toFormValues(current) : PROTOCOL_FORM_DEFAULTS);
  }, [open, current, reset]);

  const isDirty = form.formState.isDirty;
  const showSkeleton = isEdit && isFetching && !loaded;

  async function onSubmit(values: ProtocolFormValues) {
    if (isSubmitting) return;
    try {
      if (isEdit && protocol) {
        await updateMutation.mutateAsync({ ...values, id: protocol.id });
        toast.success("Protocolo atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Protocolo criado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível salvar o protocolo.",
      );
    }
  }

  function handleOpenChange(next: boolean) {
    if (!next && isSubmitting) return;
    if (!next && isDirty) {
      const confirmed = window.confirm(
        "Existem alterações não salvas. Deseja descartar as alterações?",
      );
      if (!confirmed) return;
    }
    onOpenChange(next);
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="flex w-full flex-col overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-2 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {isEdit ? "Editar protocolo" : "Novo protocolo"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Atualize as informações do protocolo mestre."
              : "Registre um novo protocolo mestre no Bella Knowledge Graph."}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nome do protocolo"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: PRT-001"
                          className="focus-visible:ring-2 focus-visible:ring-marsala"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="version"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Versão</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: 1.0"
                          className="focus-visible:ring-2 focus-visible:ring-marsala"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Categoria</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ex.: Facial"
                          className="focus-visible:ring-2 focus-visible:ring-marsala"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <FormControl>
                          <SelectTrigger className="focus-visible:ring-2 focus-visible:ring-marsala">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PROTOCOL_FORM_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>
                              {PROTOCOL_STATUS_LABELS[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="summary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Resumo</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Resumo clínico do protocolo"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="indications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Indicações</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Indicações clínicas"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contraindications"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraindicações</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={3}
                        placeholder="Contraindicações clínicas"
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <SheetFooter className="mt-2 flex-row justify-end gap-2 px-0">
                <Button
                  type="button"
                  variant="ghost"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting || !isDirty}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {isEdit ? "Salvar alterações" : "Criar protocolo"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
