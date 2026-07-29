import type { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface AttendanceRecordCardProps {
  title: string;
  icon: ReactNode;
  children: ReactNode;
}

/** Cartão modular do Raio-X da Sessão. Recebe apenas conteúdo já formatado. */
export function AttendanceRecordCard({ title, icon, children }: AttendanceRecordCardProps) {
  return (
    <Card className="border-border/70 shadow-soft">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium uppercase tracking-[0.12em] text-muted-foreground">
          <span aria-hidden="true">{icon}</span>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">{children}</CardContent>
    </Card>
  );
}

export function AttendanceField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        {label}
      </p>
      <p className="whitespace-pre-line text-sm text-foreground/90">{value ?? "Não informado"}</p>
    </div>
  );
}

export function AttendancePlaceholder({ description }: { description: string }) {
  return (
    <p className="rounded-xl border border-dashed border-border bg-muted/30 px-4 py-6 text-center text-sm text-muted-foreground">
      {description}
    </p>
  );
}
