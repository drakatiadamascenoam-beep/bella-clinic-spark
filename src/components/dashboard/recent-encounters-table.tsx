import { Inbox } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { RecentEncounter } from "@/services/dashboard.service";

interface RecentEncountersTableProps {
  encounters: RecentEncounter[];
  isLoading: boolean;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" });
}

export function RecentEncountersTable({ encounters, isLoading }: RecentEncountersTableProps) {
  return (
    <section
      aria-labelledby="recent-encounters-title"
      className="rounded-2xl border border-border bg-card shadow-soft"
    >
      <div className="border-b border-border px-5 py-4">
        <h2 id="recent-encounters-title" className="font-serif text-lg font-medium text-foreground">
          Atendimentos Recentes
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Últimos registros clínicos da clínica.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3 p-5">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : encounters.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-center">
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <Inbox className="h-5 w-5" aria-hidden="true" />
          </span>
          <p className="font-medium text-foreground">Nenhum atendimento registrado</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Assim que os atendimentos forem registrados na plataforma, eles aparecerão aqui.
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Paciente</TableHead>
                <TableHead>Profissional</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {encounters.map((encounter) => (
                <TableRow key={encounter.id}>
                  <TableCell className="font-medium">{encounter.patientName ?? "—"}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {encounter.professionalName ?? "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{encounter.status ?? "—"}</TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {formatDate(encounter.occurredAt)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
