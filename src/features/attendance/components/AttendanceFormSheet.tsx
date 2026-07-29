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
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

import {
  useAtendimento,
  useCreateAtendimento,
  useUpdateAtendimento,
} from "../hooks/useAttendance";
import type { Attendance } from "../types/attendance.types";
import {
  attendanceFormDefaults,
  attendanceSchema,
  toDateTimeLocalValue,
  type AttendanceFormData,
} from "../types/attendance-form.types";
import { AttendanceFormFields } from "./AttendanceFormFields";

export interface AttendanceFormSheetProps {
  /** null → abertura de sessão; Attendance → evolução da sessão. */
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function toFormValues(attendance: Attendance): AttendanceFormData {
  return {
    paciente_id: attendance.pacienteId ?? "",
    protocolo_id: attendance.protocoloId ?? "",
    data_atendimento: toDateTimeLocalValue(attendance.dataAtendimento),
    queixa_principal: attendance.queixaPrincipal ?? "",
    evolucao_clinica: attendance.evolucaoClinica ?? "",
    observacoes_prescricoes: attendance.observacoesPrescricoes ?? "",
  };
}

export function AttendanceFormSheet({
  attendance,
  open,
  onOpenChange,
}: AttendanceFormSheetProps) {
  const isEdit = attendance !== null;
  const { data: loaded, isFetching } = useAtendimento(
    open && attendance ? attendance.id : null,
  );
  const current = loaded ?? attendance;

  const createMutation = useCreateAtendimento();
  const updateMutation = useUpdateAtendimento();
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceSchema),
    defaultValues: attendanceFormDefaults(),
    mode: "onBlur",
  });

  const { reset } = form;
  useEffect(() => {
    if (!open) return;
    reset(current ? toFormValues(current) : attendanceFormDefaults());
  }, [open, current, reset]);

  const isDirty = form.formState.isDirty;
  const showSkeleton = isEdit && isFetching && !loaded;

  async function onSubmit(values: AttendanceFormData) {
    if (isSubmitting) return;
    try {
      if (isEdit && attendance) {
        await updateMutation.mutateAsync({ ...values, id: attendance.id });
        toast.success("Evolução clínica registrada.");
      } else {
        await createMutation.mutateAsync(values);
        toast.success("Atendimento aberto com sucesso.");
      }
      onOpenChange(false);
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível salvar o atendimento.",
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
            {isEdit ? "Evolução do atendimento" : "Novo atendimento"}
          </SheetTitle>
          <SheetDescription>
            {isEdit
              ? "Atualize a evolução clínica e as prescrições desta sessão."
              : "Abra uma nova sessão clínica vinculando paciente e protocolo mestre."}
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-2/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col gap-4">
              <AttendanceFormFields control={form.control} disabled={isSubmitting} />

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
                  disabled={isSubmitting || (isEdit && !isDirty)}
                  className="focus-visible:ring-2 focus-visible:ring-marsala"
                >
                  {isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  )}
                  {isEdit ? "Salvar evolução" : "Abrir atendimento"}
                </Button>
              </SheetFooter>
            </form>
          </Form>
        )}
      </SheetContent>
    </Sheet>
  );
}
