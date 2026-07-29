import { FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { ProtocolStatusBadge } from "./ProtocolStatusBadge";
import { ProtocolActionsMenu } from "./ProtocolActionsMenu";
import type { Protocol } from "@/services/protocol.service";

export interface ProtocolTableProps {
  protocols: Protocol[];
  isLoading?: boolean;
  sourceUnavailable?: boolean;
  onSelect: (protocol: Protocol) => void;
  onEdit: (protocol: Protocol) => void;
}

function formatDate(value: string | null): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short" }).format(date);
}

export function ProtocolTable({
  protocols,
  isLoading = false,
  sourceUnavailable = false,
  onSelect,
  onEdit,
}: ProtocolTableProps) {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="w-[38%]">Protocolo</TableHead>
            <TableHead className="hidden md:table-cell">Categoria</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="hidden lg:table-cell">Versão</TableHead>
            <TableHead className="hidden sm:table-cell text-right">Atualizado</TableHead>
            <TableHead className="w-12 text-right sr-only">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading &&
            Array.from({ length: 5 }).map((_, index) => (
              <TableRow key={`skeleton-${index}`}>
                <TableCell>
                  <Skeleton className="h-4 w-56" />
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  <Skeleton className="h-4 w-28" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-20 rounded-full" />
                </TableCell>
                <TableCell className="hidden lg:table-cell">
                  <Skeleton className="h-4 w-12" />
                </TableCell>
                <TableCell className="hidden sm:table-cell">
                  <Skeleton className="ml-auto h-4 w-20" />
                </TableCell>
                <TableCell>
                  <Skeleton className="ml-auto h-8 w-8 rounded-md" />
                </TableCell>
              </TableRow>
            ))}

          {!isLoading && protocols.length === 0 && (
            <TableRow className="hover:bg-transparent">
              <TableCell colSpan={6}>
                <div className="flex flex-col items-center justify-center gap-2 py-14 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <FileText className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <p className="font-medium text-foreground">
                    {sourceUnavailable
                      ? "Fonte de protocolos indisponível"
                      : "Nenhum protocolo encontrado"}
                  </p>
                  <p className="max-w-md text-sm text-muted-foreground">
                    {sourceUnavailable
                      ? "A base de Protocolos Mestres do Bella Knowledge Graph v3.0 ainda não está publicada nesta instância. Os registros aparecerão automaticamente assim que a fonte estiver disponível."
                      : "Ajuste os filtros ou a busca para localizar outros protocolos."}
                  </p>
                </div>
              </TableCell>
            </TableRow>
          )}

          {!isLoading &&
            protocols.map((protocol) => (
              <TableRow
                key={protocol.id}
                tabIndex={0}
                role="button"
                aria-label={`Abrir detalhes do protocolo ${protocol.name}`}
                onClick={() => onSelect(protocol)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onSelect(protocol);
                  }
                }}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala"
              >
                <TableCell>
                  <p className="font-medium text-foreground">{protocol.name}</p>
                  {protocol.code && (
                    <p className="text-xs text-muted-foreground">{protocol.code}</p>
                  )}
                </TableCell>
                <TableCell className="hidden md:table-cell text-muted-foreground">
                  {protocol.category ?? "—"}
                </TableCell>
                <TableCell>
                  <ProtocolStatusBadge status={protocol.status} />
                </TableCell>
                <TableCell className="hidden lg:table-cell text-muted-foreground">
                  {protocol.version ?? "—"}
                </TableCell>
                <TableCell className="hidden sm:table-cell text-right text-muted-foreground">
                  {formatDate(protocol.updatedAt)}
                </TableCell>
                <TableCell className="text-right">
                  <ProtocolActionsMenu protocol={protocol} onEdit={onEdit} />
                </TableCell>
              </TableRow>
            ))}
        </TableBody>
      </Table>
    </div>
  );
}
