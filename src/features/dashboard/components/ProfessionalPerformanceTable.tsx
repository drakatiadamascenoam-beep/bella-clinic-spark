import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WidgetShell } from "./WidgetShell";
import type { ProfessionalPerformanceRow } from "../types/dashboard.types";

export interface ProfessionalPerformanceTableProps {
  rows: ProfessionalPerformanceRow[];
  isLoading?: boolean;
  isError?: boolean;
  available?: boolean;
  onRetry?: () => void;
}

function show(value: number | null, suffix = ""): string {
  return value === null ? "—" : `${value.toLocaleString("pt-BR")}${suffix}`;
}

export function ProfessionalPerformanceTable({
  rows,
  isLoading,
  isError,
  available = true,
  onRetry,
}: ProfessionalPerformanceTableProps) {
  return (
    <WidgetShell
      title="Desempenho por profissional"
      description="Ocupação, volume e desfechos da equipe clínica"
      isLoading={isLoading}
      isError={isError}
      available={available}
      isEmpty={rows.length === 0}
      emptyMessage="Nenhum profissional com atividade no período selecionado."
      onRetry={onRetry}
    >
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profissional</TableHead>
              <TableHead className="text-right">Compromissos</TableHead>
              <TableHead className="text-right">Atendidos</TableHead>
              <TableHead className="text-right">Faltas</TableHead>
              <TableHead className="text-right">Cancelados</TableHead>
              <TableHead className="text-right">Tempo médio</TableHead>
              <TableHead className="text-right">Ocupação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">{row.name}</TableCell>
                <TableCell className="text-right">{row.appointments}</TableCell>
                <TableCell className="text-right">{row.attended}</TableCell>
                <TableCell className="text-right">{row.absences}</TableCell>
                <TableCell className="text-right">{row.cancellations}</TableCell>
                <TableCell className="text-right">{show(row.averageMinutes, " min")}</TableCell>
                <TableCell className="text-right">{show(row.occupancy, "%")}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </WidgetShell>
  );
}
