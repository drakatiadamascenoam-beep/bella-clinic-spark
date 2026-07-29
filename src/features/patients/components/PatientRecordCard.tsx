import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface PatientRecordCardProps {
  title: string;
  icon: ReactNode;
  /** Rótulo de módulo futuro (Sprint 6). */
  upcoming?: boolean;
  children: ReactNode;
}

/**
 * Cartão modular do Raio-X de Prontuário.
 * Desacoplado do domínio: recebe apenas conteúdo já formatado.
 */
export function PatientRecordCard({
  title,
  icon,
  upcoming = false,
  children,
}: PatientRecordCardProps) {
  return (
    <Card className="border-border/70 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <span aria-hidden="true">{icon}</span>
          {title}
          {upcoming && (
            <span className="ml-auto rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium tracking-normal text-muted-foreground">
              Sprint 6
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export function PatientField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="text-sm text-foreground/90">{value ?? "Não informado"}</p>
    </div>
  );
}

export function PatientPlaceholder({ description }: { description: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
      {description}
    </p>
  );
}
