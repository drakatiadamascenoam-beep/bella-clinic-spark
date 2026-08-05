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
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { useCreateProfissional, useUpdateProfissional } from "../hooks/useProfessional";
import {
  professionalFormDefaults,
  professionalSchema,
  type ProfessionalFormData,
} from "../types/professional-form.types";
import type { Professional } from "../types/professional.types";
import { ProfessionalFormFields } from "./ProfessionalFormFields";

export interface ProfessionalFormSheetProps {
  /** Profissional em edição; `null` abre o drawer em modo de cadastro. */
  professional: Professional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Indica carregamento do registro em edição (exibe skeleton). */
  isLoading?: boolean;
}

function toFormValues(professional: Professional): ProfessionalFormData {
  return {
    nome: professional.nome,
    papel_clinico: professional.papelClinico,
    conselho_profissional: professional.conselhoProfissional ?? "",
    registro_profissional: professional.registroProfissional ?? "",
    especialidade: professional.especialidade ?? "",
    email: professional.email ?? "",
    telefone: professional.telefone ?? "",
    dias_atendimento: professional.diasAtendimento,
    horario_inicio: professional.horarioInicio,
    horario_fim: professional.horarioFim,
    intervalo_inicio: professional.intervaloInicio ?? "",
    intervalo_fim: professional.intervaloFim ?? "",
    ativo: professional.ativo,
  };
}

export function ProfessionalFormSheet({
  professional,
  open,
  onOpenChange,
  isLoading = false,
}: ProfessionalFormSheetProps) {
  const createMutation = useCreateProfissional();
  const updateMutation = useUpdateProfissional();
  const isEditing = professional !== null;
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<ProfessionalFormData>({
    resolver: zodResolver(professionalSchema),
    defaultValues: professionalFormDefaults(),
    mode: "onBlur",
  });

  const { reset } = form;
  useEffect(() => {
    if (!open) return;
    reset(professional ? toFormValues(professional) : professionalFormDefaults());
  }, [open, professional, reset]);

  const isDirty = form.formState.isDirty;

  async function onSubmit(values: ProfessionalFormData) {
    if (isSubmitting) return;
    try {
      if (professional) {
        await updateMutation.mutateAsync({ ...values, id: professional.id });
        toast.success("Profissional atualizado com sucesso.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Profissional cadastrado com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível salvar o profissional.",
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
            {isEditing ? "Editar profissional" : "Novo profissional"}
          </SheetTitle>
          <SheetDescription>
            Dados cadastrais, conselho profissional e jornada de atendimento da equipe.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton key={`field-${index}`} className="h-10 w-full rounded-xl" />
            ))}
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4">
              <ProfessionalFormFields control={form.control} />

              <SheetFooter className="mt-auto flex-row justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSubmitting}
                  onClick={() => handleOpenChange(false)}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {isEditing ? "Salvar alterações" : "Cadastrar profissional"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
