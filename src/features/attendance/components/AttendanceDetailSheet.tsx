import { toast } from "sonner";
import {
  ClipboardList,
  FileText,
  History,
  Loader2,
  Pencil,
  Pill,
  Stethoscope,
  User,
} from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";

import { availableTransitions, isEditable } from "../domain/attendance-flow";
import type { AttendanceStatus } from "../domain/attendance-status";
import { useAtendimento, useChangeAtendimentoStatus } from "../hooks/useAttendance";
import type { Attendance } from "../types/attendance.types";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import {
  AttendanceField,
  AttendancePlaceholder,
  AttendanceRecordCard,
} from "./AttendanceRecordCard";
import { formatDateTime } from "./attendance-format";

export interface AttendanceDetailSheetProps {
  attendance: Attendance | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (attendance: Attendance) => void;
}

export function AttendanceDetailSheet({
  attendance,
  open,
  onOpenChange,
  onEdit,
}: AttendanceDetailSheetProps) {
  const { data, isFetching } = useAtendimento(open && attendance ? attendance.id : null);
  const current = data ?? attendance;
  const statusMutation = useChangeAtendimentoStatus();

  async function handleTransition(id: string, status: AttendanceStatus) {
    if (statusMutation.isPending) return;
    try {
      await statusMutation.mutateAsync({ id, status });
      toast.success("Status do atendimento atualizado.");
    } catch (error) {
      toast.error(
        error instanceof Error && error.message.length > 0
          ? error.message
          : "Não foi possível alterar o status do atendimento.",
      );
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader className="space-y-3 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {current?.pacienteNome ?? "Sessão clínica"}
          </SheetTitle>
          <SheetDescription>
            {current
              ? `Atendimento de ${formatDateTime(current.dataAtendimento)}`
              : "Raio-X da sessão de atendimento clínico."}
          </SheetDescription>
          {current && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <AttendanceStatusBadge status={current.status} />
              <div className="flex flex-wrap items-center gap-2">
                {isEditable(current.status) && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(current)}
                    className="focus-visible:ring-2 focus-visible:ring-marsala"
                  >
                    <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                    Evoluir
                  </Button>
                )}
                {availableTransitions(current.status).map((transition) => (
                  <Button
                    key={transition.target}
                    type="button"
                    size="sm"
                    variant={transition.sensitive ? "outline" : "default"}
                    disabled={statusMutation.isPending}
                    onClick={() => void handleTransition(current.id, transition.target)}
                    className="focus-visible:ring-2 focus-visible:ring-marsala"
                  >
                    {statusMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    )}
                    {transition.label}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </SheetHeader>

        <Separator className="my-5" />

        {isFetching && !data ? (
          <div className="space-y-4">
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : current ? (
          <div className="space-y-4">
            <AttendanceRecordCard title="Paciente" icon={<User className="h-4 w-4" />}>
              <AttendanceField label="Nome" value={current.pacienteNome} />
              <AttendanceField label="Identificador" value={current.pacienteId} />
            </AttendanceRecordCard>

            <AttendanceRecordCard
              title="Protocolo aplicado"
              icon={<Stethoscope className="h-4 w-4" />}
            >
              {current.protocoloNome || current.protocoloId ? (
                <AttendanceField
                  label="Protocolo mestre"
                  value={current.protocoloNome ?? current.protocoloId}
                />
              ) : (
                <AttendancePlaceholder description="Nenhum protocolo mestre vinculado a esta sessão." />
              )}
            </AttendanceRecordCard>

            <AttendanceRecordCard
              title="Queixa principal"
              icon={<ClipboardList className="h-4 w-4" />}
            >
              {current.queixaPrincipal ? (
                <AttendanceField label="Relato" value={current.queixaPrincipal} />
              ) : (
                <AttendancePlaceholder description="Queixa principal não registrada nesta sessão." />
              )}
            </AttendanceRecordCard>

            <AttendanceRecordCard title="Evolução clínica" icon={<FileText className="h-4 w-4" />}>
              {current.evolucaoClinica ? (
                <AttendanceField label="Registro" value={current.evolucaoClinica} />
              ) : (
                <AttendancePlaceholder description="Nenhuma evolução clínica registrada." />
              )}
            </AttendanceRecordCard>

            <AttendanceRecordCard
              title="Observações e prescrições"
              icon={<Pill className="h-4 w-4" />}
            >
              {current.observacoesPrescricoes ? (
                <AttendanceField label="Conduta" value={current.observacoesPrescricoes} />
              ) : (
                <AttendancePlaceholder description="Nenhuma prescrição ou observação registrada." />
              )}
            </AttendanceRecordCard>

            <AttendanceRecordCard title="Timeline" icon={<History className="h-4 w-4" />}>
              <AttendanceField
                label="Abertura"
                value={current.createdAt ? formatDateTime(current.createdAt) : null}
              />
              <AttendanceField
                label="Última atualização"
                value={current.updatedAt ? formatDateTime(current.updatedAt) : null}
              />
            </AttendanceRecordCard>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Não foi possível carregar os detalhes desta sessão.
          </p>
        )}
      </SheetContent>
    </Sheet>
  );
}
