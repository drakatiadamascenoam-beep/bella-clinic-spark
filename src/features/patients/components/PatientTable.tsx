import { ArrowDown, ArrowUp, Eye, MoreHorizontal, Pencil, Users } from "lucide-react";
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
import { formatBirthDate, formatCpf, formatDate, formatPhone } from "./patient-format";
import type { Patient, PatientSortDirection, PatientSortField } from "../types/patient.types";

export interface PatientTableProps {
  patients: Patient[];
  isLoading?: boolean;
  sourceUnavailable?: boolean;
  sortBy: PatientSortField;
  sortDir: PatientSortDirection;
  onSortChange: (field: PatientSortField) => void;
  onSelect: (patient: Patient) => void;
  onEdit: (patient: Patient) => void;
}

interface SortButtonProps {
  label: string;
  field: PatientSortField;
  sortBy: PatientSortField;
  sortDir: PatientSortDirection;
  onSortChange: (field: PatientSortField) => void;
}

function SortButton({ label, field, sortBy, sortDir, onSortChange }: SortButtonProps) {
  const active = sortBy === field;
  return (
    <button
      type="button"
      onClick={() => onSortChange(field)}
      aria-label={`Ordenar por ${label}`}
      className="inline-flex items-center gap-1 rounded-md font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
    >
      {label}
      {active &&
        (sortDir === "asc" ? (
          <ArrowUp className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ArrowDown className="h-3 w-3" aria-hidden="true" />
        ))}
    </button>
  );
}

export function PatientTable({
  patients,
  isLoading = false,
  sourceUnavailable = false,
  sortBy,
  sortDir,
  onSortChange,
  onSelect,
  onEdit,
}: PatientTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[34%]">
              <SortButton
                label="Paciente"
                field="nome"
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={onSortChange}
              />
            </TableHead>
            <TableHead className="hidden md:table-cell">CPF</TableHead>
            <TableHead className="hidden lg:table-cell">Nascimento / Idade</TableHead>
            <TableHead className="hidden sm:table-cell">Contato</TableHead>
            <TableHead className="hidden xl:table-cell text-right">
              <SortButton
                label="Cadastro"
                field="created_at"
                sortBy={sortBy}
                sortDir={sortDir}
                onSortChange={onSortChange}
              />
            </TableHead>
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
                  <Skeleton className="h-4 w-48" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-24" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && patients.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="font-medium text-foreground">
                    {sourceUnavailable
                      ? "Fonte de pacientes indisponível"
                      : "Nenhum paciente encontrado"}
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {sourceUnavailable
                      ? "A base de Pacientes do Bella Knowledge Graph v3.0 ainda não está publicada nesta instância. Os registros aparecerão automaticamente assim que a fonte estiver disponível."
                      : "Ajuste a pesquisa rápida ou cadastre um novo paciente."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            patients.map((patient) => (
              <TableRow
                key={patient.id}
                tabIndex={0}
                role="button"
                aria-label={`Abrir prontuário de ${patient.nome}`}
                onClick={() => onSelect(patient)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(patient);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <TableCell>
                  <p className="font-medium text-foreground">{patient.nome}</p>
                  {patient.nomeSocial && (
                    <p className="text-xs text-muted-foreground">
                      Nome social: {patient.nomeSocial}
                    </p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatCpf(patient.cpf)}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {formatBirthDate(patient.dataNascimento)}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-muted-foreground">
                  <p>{formatPhone(patient.telefone)}</p>
                  {patient.email && <p className="text-xs">{patient.email}</p>}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-right text-muted-foreground">
                  {formatDate(patient.createdAt)}
                </TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ações para ${patient.nome}`}
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onSelect(patient)}>
                        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                        Raio-X do prontuário
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEdit(patient)}>
                        <Pencil className="mr-2 h-4 w-4" aria-hidden="true" />
                        Editar cadastro
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
