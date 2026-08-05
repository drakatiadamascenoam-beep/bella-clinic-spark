import { Eye, MoreHorizontal, Pencil, Users } from "lucide-react";
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
import { professionalFormatSchedule, professionalRoleLabels } from "../types/professional-view";
import { formatRegistrationDisplay } from "./professional-format";
import { ProfessionalStatusBadge } from "./ProfessionalStatusBadge";
import type { Professional } from "../types/professional.types";

export interface ProfessionalTableProps {
  professionals: Professional[];
  isLoading?: boolean;
  sourceUnavailable?: boolean;
  onSelect: (professional: Professional) => void;
  onEdit: (professional: Professional) => void;
}

export function ProfessionalTable({
  professionals,
  isLoading = false,
  sourceUnavailable = false,
  onSelect,
  onEdit,
}: ProfessionalTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[28%]">Nome</TableHead>
            <TableHead className="hidden md:table-cell">Conselho & Registro</TableHead>
            <TableHead className="hidden lg:table-cell">Papel / Especialidade</TableHead>
            <TableHead className="hidden xl:table-cell">Jornada</TableHead>
            <TableHead>Status</TableHead>
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
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell className="hidden xl:table-cell">
                  <Skeleton className="h-4 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-16" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && professionals.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <Users className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="font-medium text-foreground">
                    {sourceUnavailable
                      ? "Fonte de dados indisponível (Aguardando BKG v3.0)"
                      : "Nenhum profissional encontrado"}
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {sourceUnavailable
                      ? "A base de Profissionais do Bella Knowledge Graph v3.0 ainda não está publicada nesta instância. Os registros aparecerão automaticamente assim que a fonte estiver disponível."
                      : "Ajuste a pesquisa ou cadastre um novo profissional."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            professionals.map((professional) => (
              <TableRow
                key={professional.id}
                tabIndex={0}
                role="button"
                aria-label={`Abrir detalhes de ${professional.nome}`}
                onClick={() => onSelect(professional)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(professional);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <TableCell>
                  <p className="font-medium text-foreground">{professional.nome}</p>
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {formatRegistrationDisplay(
                    professional.conselhoProfissional,
                    professional.registroProfissional,
                  )}
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  <p>{professionalRoleLabels[professional.papelClinico]}</p>
                  {professional.especialidade && (
                    <p className="text-xs">{professional.especialidade}</p>
                  )}
                </TableCell>
                <TableCell className="hidden xl:table-cell text-muted-foreground">
                  {professionalFormatSchedule({
                    diasAtendimento: professional.diasAtendimento,
                    horarioInicio: professional.horarioInicio,
                    horarioFim: professional.horarioFim,
                    intervaloInicio: professional.intervaloInicio,
                    intervaloFim: professional.intervaloFim,
                  })}
                </TableCell>
                <TableCell>
                  <ProfessionalStatusBadge ativo={professional.ativo} />
                </TableCell>
                <TableCell className="text-right" onClick={(event) => event.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Ações para ${professional.nome}`}
                        className="focus-visible:ring-2 focus-visible:ring-marsala"
                      >
                        <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onSelect={() => onSelect(professional)}>
                        <Eye className="mr-2 h-4 w-4" aria-hidden="true" />
                        Ver detalhes
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onEdit(professional)}>
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
