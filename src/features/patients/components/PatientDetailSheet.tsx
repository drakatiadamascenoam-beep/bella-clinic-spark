import {
  Activity,
  CalendarClock,
  ClipboardList,
  IdCard,
  Phone,
  ShieldAlert,
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
import { Pencil } from "lucide-react";

import { usePaciente } from "../hooks/usePatient";
import type { Patient } from "../types/patient.types";
import { PATIENT_SEXO_LABELS } from "../types/patient-form.types";
import { calculateAge, formatCpf, formatDate, formatPhone } from "./patient-format";
import { PatientField, PatientPlaceholder, PatientRecordCard } from "./PatientRecordCard";

export interface PatientDetailSheetProps {
  patient: Patient | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (patient: Patient) => void;
}

function sexoLabel(value: string | null): string | null {
  if (!value) return null;
  const key = value.toLowerCase();
  return key in PATIENT_SEXO_LABELS
    ? PATIENT_SEXO_LABELS[key as keyof typeof PATIENT_SEXO_LABELS]
    : value;
}

export function PatientDetailSheet({
  patient,
  open,
  onOpenChange,
  onEdit,
}: PatientDetailSheetProps) {
  const { data, isFetching } = usePaciente(open && patient ? patient.id : null);
  const current = data ?? patient;
  const age = calculateAge(current?.dataNascimento ?? null);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader className="space-y-3 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {current?.nome ?? "Paciente"}
          </SheetTitle>
          <SheetDescription>
            Raio-X do prontuário — visão consolidada do paciente na Bella Clinic Platform.
          </SheetDescription>
          {current && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-xs text-muted-foreground">
                Cadastrado em {formatDate(current.createdAt)}
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onEdit(current)}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <Pencil className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                Editar
              </Button>
            </div>
          )}
        </SheetHeader>

        <Separator className="my-4" />

        {isFetching && !data ? (
          <div className="space-y-4">
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-28 w-full rounded-xl" />
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        ) : (
          current && (
            <div className="space-y-4 pb-6">
              <PatientRecordCard
                title="Dados cadastrais & identificadores"
                icon={<IdCard className="h-4 w-4" />}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <PatientField label="Nome completo" value={current.nome} />
                  <PatientField label="Nome social" value={current.nomeSocial} />
                  <PatientField label="CPF" value={current.cpf ? formatCpf(current.cpf) : null} />
                  <PatientField label="Sexo" value={sexoLabel(current.sexo)} />
                  <PatientField
                    label="Data de nascimento"
                    value={current.dataNascimento ? formatDate(current.dataNascimento) : null}
                  />
                  <PatientField label="Idade" value={age === null ? null : `${age} anos`} />
                </div>
              </PatientRecordCard>

              <PatientRecordCard
                title="Informações de contato"
                icon={<Phone className="h-4 w-4" />}
              >
                <div className="grid gap-3 sm:grid-cols-2">
                  <PatientField
                    label="Telefone"
                    value={current.telefone ? formatPhone(current.telefone) : null}
                  />
                  <PatientField label="E-mail" value={current.email} />
                </div>
              </PatientRecordCard>

              <PatientRecordCard
                title="Alergias & observações técnicas"
                icon={<ShieldAlert className="h-4 w-4" />}
              >
                <p className="whitespace-pre-line text-sm text-foreground/90">
                  {current.observacoesAlergias ?? "Nenhuma alergia ou observação registrada."}
                </p>
              </PatientRecordCard>

              <PatientRecordCard
                title="Protocolos vinculados"
                icon={<ClipboardList className="h-4 w-4" />}
                upcoming
              >
                <PatientPlaceholder description="A vinculação de Protocolos Mestres ao paciente será liberada com o módulo de Atendimento Clínico." />
              </PatientRecordCard>

              <PatientRecordCard
                title="Histórico de atendimentos"
                icon={<Activity className="h-4 w-4" />}
                upcoming
              >
                <PatientPlaceholder description="O histórico de atendimentos será exibido assim que o módulo clínico consumir a fonte de encontros do Bella Knowledge Graph v3.0." />
              </PatientRecordCard>

              <PatientRecordCard
                title="Linha do tempo clínica"
                icon={<CalendarClock className="h-4 w-4" />}
                upcoming
              >
                <PatientPlaceholder description="A timeline consolidada de eventos clínicos será construída sobre os atendimentos e protocolos vinculados." />
              </PatientRecordCard>
            </div>
          )
        )}
      </SheetContent>
    </Sheet>
  );
}
