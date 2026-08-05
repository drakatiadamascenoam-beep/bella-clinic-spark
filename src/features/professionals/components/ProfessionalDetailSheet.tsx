import { CalendarClock, ClipboardList, Pencil, Stethoscope } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

import { useProfessionalAvailability } from "../hooks/useProfessionalAvailability";
import {
  professionalFormatSchedule,
  professionalRoleLabels,
} from "../types/professional-view";
import type { Professional } from "../types/professional.types";
import { ProfessionalStatusBadge } from "./ProfessionalStatusBadge";
import { formatContact, formatDate, formatRegistrationDisplay } from "./professional-format";

export interface ProfessionalDetailSheetProps {
  professional: Professional | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit: (professional: Professional) => void;
}

function Card({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <h3 className="flex items-center gap-2 font-serif text-lg font-medium text-foreground">
        {icon}
        {title}
      </h3>
      <div className="mt-3 space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{value}</span>
    </div>
  );
}

function Placeholder({ text }: { text: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/40 p-3 text-sm text-muted-foreground">
      {text}
    </p>
  );
}

/** Raio-X do Profissional — cartões modulares de cadastro, jornada e vínculos. */
export function ProfessionalDetailSheet({
  professional,
  open,
  onOpenChange,
  onEdit,
}: ProfessionalDetailSheetProps) {
  const reference = new Date().toISOString();
  const availability = useProfessionalAvailability(professional, reference);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto sm:max-w-xl">
        <SheetHeader className="space-y-2 text-left">
          <SheetTitle className="font-serif text-2xl font-medium">
            {professional?.nome ?? "Profissional"}
          </SheetTitle>
          <SheetDescription>
            Raio-X do profissional: cadastro, conselho, jornada e vínculos operacionais.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {professional && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between gap-3">
              <ProfessionalStatusBadge ativo={professional.ativo} />
              <Button
                type="button"
                variant="outline"
                onClick={() => onEdit(professional)}
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                Editar
              </Button>
            </div>

            <Card title="Dados cadastrais & registro">
              <Row label="Papel clínico" value={professionalRoleLabels[professional.papelClinico]} />
              <Row label="Especialidade" value={professional.especialidade ?? "—"} />
              <Row
                label="Conselho & registro"
                value={formatRegistrationDisplay(
                  professional.conselhoProfissional,
                  professional.registroProfissional,
                )}
              />
              <Row label="Contato" value={formatContact(professional.email, professional.telefone)} />
              <Row label="Cadastrado em" value={formatDate(professional.createdAt)} />
            </Card>

            <Card
              title="Jornada & horários de atendimento"
              icon={<CalendarClock className="h-4 w-4 text-marsala" aria-hidden="true" />}
            >
              <p className="text-foreground">
                {professionalFormatSchedule({
                  diasAtendimento: professional.diasAtendimento,
                  horarioInicio: professional.horarioInicio,
                  horarioFim: professional.horarioFim,
                  intervaloInicio: professional.intervaloInicio,
                  intervaloFim: professional.intervaloFim,
                })}
              </p>
            </Card>

            <Card
              title="Histórico de atendimentos"
              icon={<Stethoscope className="h-4 w-4 text-marsala" aria-hidden="true" />}
            >
              <Placeholder text="Fonte de dados indisponível (Aguardando BKG v3.0). O histórico clínico do profissional será consolidado quando as tabelas de atendimento estiverem publicadas." />
            </Card>

            <Card
              title="Agenda vinculada"
              icon={<ClipboardList className="h-4 w-4 text-marsala" aria-hidden="true" />}
            >
              <Placeholder text="Fonte de dados indisponível (Aguardando BKG v3.0). Os compromissos vinculados a este profissional aparecerão aqui." />
            </Card>

            <Card title="Disponibilidade clínica">
              <Row
                label="Apto a receber agendamentos"
                value={availability.hasCoverage ? "Sim" : "Não"}
              />
              <Row label="Disponível agora" value={availability.available ? "Sim" : "Não"} />
              <p className="text-muted-foreground">{availability.reason}</p>
            </Card>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
