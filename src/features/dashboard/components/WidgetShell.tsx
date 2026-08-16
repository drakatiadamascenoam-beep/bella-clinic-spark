import * as React from "react";
import { AlertCircle, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export interface WidgetShellProps {
  title: string;
  description?: string;
  isLoading?: boolean;
  isError?: boolean;
  available?: boolean;
  isEmpty?: boolean;
  emptyMessage?: string;
  onRetry?: () => void;
  action?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Casca comum dos widgets do Cockpit: carregando, erro com retry,
 * fonte indisponível e estado vazio — sempre por widget, nunca global.
 */
export function WidgetShell({
  title,
  description,
  isLoading = false,
  isError = false,
  available = true,
  isEmpty = false,
  emptyMessage = "Sem dados no período selecionado.",
  onRetry,
  action,
  children,
}: WidgetShellProps) {
  return (
    <Card className="border-border/60 bg-card shadow-soft">
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0">
        <div className="space-y-1">
          <CardTitle className="font-serif text-lg font-medium">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : isError ? (
          <div className="flex flex-col items-start gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <p className="flex items-center gap-2 text-sm text-foreground">
              <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />
              Não foi possível carregar este indicador.
            </p>
            {onRetry && (
              <Button variant="outline" size="sm" onClick={onRetry} className="rounded-lg">
                <RefreshCcw className="mr-2 h-3.5 w-3.5" aria-hidden="true" />
                Tentar novamente
              </Button>
            )}
          </div>
        ) : !available ? (
          <p className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            Aguardando BKG v3.0 · dados em agregação. Este painel será preenchido automaticamente
            assim que a fonte estiver publicada.
          </p>
        ) : isEmpty ? (
          <p className="rounded-xl border border-dashed border-border/70 p-6 text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
