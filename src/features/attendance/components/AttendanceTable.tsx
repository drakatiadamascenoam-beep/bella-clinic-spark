import { Eye, MoreHorizontal, Pencil, Stethoscope } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { isEditable } from "../domain/attendance-flow";
import type { Attendance } from "../types/attendance.types";
import { AttendanceStatusBadge } from "./AttendanceStatusBadge";
import { formatDateTime } from "./attendance-format";

export interface AttendanceTableProps {
  attendances: Attendance[];
  isLoading?: boolean;
  sourceUnavailable?: boolean;
  onSelect: (attendance: Attendance) => void;
  onEdit: (attendance: Attendance) => void;
}

export function AttendanceTable({
  attendances,
  isLoading = false,
  sourceUnavailable = false,
  onSelect,
  onEdit,
}: AttendanceTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[22%]">Data</TableHead>
            <TableHead className="w-[28%]">Paciente</TableHead>
            <TableHead className="hidden md:table-cell">Protocolo aplicado</TableHead>
            <TableHead className="hidden sm:table-cell">Status</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">Ações</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-44" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-36" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-5 w-24 rounded-full" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && attendances.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={5}>
                <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Stethoscope className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="font-medium text-foreground">
                    {sourceUnavailable
                      ? "Fonte de dados indisponível (Aguardando BKG v3.0)"
                      : "Nenhum atendimento encontrado"}
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {sourceUnavailable
                      ? "A base de Atendimentos do Bella Knowledge Graph v3.0 ainda não está publicada nesta instância. As sessões aparecerão automaticamente assim que a fonte estiver disponível."
                      : "Ajuste a pesquisa rápida ou abra um novo atendimento."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            attendances.map((attendance) => (
              <TableRow
                key={attendance.id}
                tabIndex={0}
                role="button"
                aria-label={`Abrir sessão de ${attendance.pacienteNome ?? "paciente"}`}
                onClick={() => onSelect(attendance)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(attendance);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <TableCell className="text-muted-foreground">
                  {formatDateTime(attendance.dataAtendimento)}
                </TableCell>
                <TableCell>
                  <p className="font-medium text-foreground">
                    {attendance.pacienteNome ?? "Paciente não identificado"}
                  </p>
                  <div className="sm:hidden">
                    <AttendanceStatusBadge status={attendance.status} className="mt-1" />
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {attendance.protocoloNome ?? "Sem protocolo vinculado"}
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <AttendanceStatusBadge status={attendance.status} />
                </TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ações do atendimento de ${attendance.pacienteNome ?? "paciente"}`}
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onSelect(attendance)}>
                        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                        Raio-X da sessão
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={!isEditable(attendance.status)}
                        onSelect={() => onEdit(attendance)}
                      >
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Registrar evolução
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
