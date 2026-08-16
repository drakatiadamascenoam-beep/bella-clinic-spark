import { useState } from "react";
import { Loader2, Send } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

import { useClinicalAssistant } from "../hooks/useClinicalAssistant";
import type { ChatMessage } from "../types/ai.types";
import type { BuildClinicalContextInput } from "../types/intelligence-io.types";

export interface BellaAIAssistantSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Contexto clínico já resolvido, sem a pergunta. Null = contexto indisponível. */
  context: Omit<BuildClinicalContextInput, "question"> | null;
}

/** Painel do assistente clínico da Bella IA (apoio à decisão, nunca diagnóstico). */
export function BellaAIAssistantSheet({ open, onOpenChange, context }: BellaAIAssistantSheetProps) {
  const [question, setQuestion] = useState("");
  const [history, setHistory] = useState<readonly ChatMessage[]>([]);
  const assistant = useClinicalAssistant();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!context || assistant.isPending) return;
    const trimmed = question.trim();
    if (trimmed.length === 0) return;

    const asked = trimmed;
    setQuestion("");
    try {
      const result = await assistant.mutateAsync({ ...context, question: asked });
      setHistory((prev) => [
        ...prev,
        {
          id: `local-${result.metadata.requestId}`,
          role: "user",
          content: asked,
          createdAt: result.metadata.timestamp,
        },
        result.data,
      ]);
    } catch {
      /* estado de erro é renderizado a partir de assistant.isError */
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="flex w-full flex-col gap-0 sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-serif text-xl font-medium">Assistente Bella IA</SheetTitle>
          <SheetDescription>
            Apoio à decisão clínica com contexto estruturado. Toda saída exige confirmação
            profissional.
          </SheetDescription>
        </SheetHeader>

        <Separator className="my-4" />

        {!context ? (
          <p className="text-sm text-muted-foreground">
            Contexto clínico indisponível. Selecione um paciente e um atendimento para iniciar a
            interação com a Bella IA.
          </p>
        ) : (
          <>
            <dl className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Paciente</dt>
                <dd className="text-foreground">{context.patient.name}</dd>
              </div>
              <div>
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">
                  Profissional
                </dt>
                <dd className="text-foreground">{context.professional.name}</dd>
              </div>
              <div className="col-span-2">
                <dt className="text-xs uppercase tracking-wide text-muted-foreground">Queixa</dt>
                <dd className="text-foreground">{context.attendance.complaint}</dd>
              </div>
            </dl>

            <div className="mt-4 flex-1 space-y-4 overflow-y-auto pr-1">
              {history.length === 0 && !assistant.isPending && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma interação nesta sessão. Faça a primeira pergunta clínica.
                </p>
              )}

              {history.map((message) => (
                <article
                  key={message.id}
                  className={
                    message.role === "user"
                      ? "rounded-lg border border-border bg-muted/40 p-3"
                      : "rounded-lg border border-border bg-card p-3"
                  }
                >
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">
                    {message.role === "user" ? "Profissional" : "Bella IA"}
                  </p>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-foreground">
                    {message.content}
                  </p>
                </article>
              ))}

              {assistant.isPending && (
                <p
                  aria-live="polite"
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  Bella IA está analisando o contexto clínico…
                </p>
              )}

              {assistant.isError && (
                <p role="alert" className="text-sm text-destructive">
                  {assistant.error instanceof Error && assistant.error.message.length > 0
                    ? assistant.error.message
                    : "Não foi possível obter resposta da Bella IA."}
                </p>
              )}
            </div>

            <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2">
              <Label htmlFor="bella-question">Pergunta clínica</Label>
              <Textarea
                id="bella-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={3}
                placeholder="Descreva a dúvida clínica relacionada ao contexto acima"
                className="focus-visible:ring-2 focus-visible:ring-marsala"
              />
              <Button
                type="submit"
                disabled={assistant.isPending || question.trim().length === 0}
                className="self-end focus-visible:ring-2 focus-visible:ring-marsala"
              >
                {assistant.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                Enviar pergunta
              </Button>
            </form>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
