import { createFileRoute, redirect } from "@tanstack/react-router";
import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface OAuthClient {
  name?: string | null;
  client_name?: string | null;
}

interface AuthorizationDetails {
  client?: OAuthClient | null;
  redirect_url?: string | null;
  redirect_to?: string | null;
}

interface OAuthResult {
  data: AuthorizationDetails | null;
  error: { message: string } | null;
}

interface OAuthNamespace {
  getAuthorizationDetails(authorizationId: string): Promise<OAuthResult>;
  approveAuthorization(authorizationId: string): Promise<OAuthResult>;
  denyAuthorization(authorizationId: string): Promise<OAuthResult>;
}

function oauth(): OAuthNamespace {
  return (supabase.auth as unknown as { oauth: OAuthNamespace }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (search: Record<string, unknown>) => ({
    authorization_id: typeof search.authorization_id === "string" ? search.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Requisição de autorização inválida.");
    const { data } = await supabase.auth.getSession();
    if (!data.session) {
      const next = location.pathname + location.searchStr;
      throw redirect({ to: "/auth", search: { redirect: next } });
    }
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id") ?? "";
    const { data, error } = await oauth().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: ConsentPage,
  errorComponent: ({ error }) => (
    <ConsentShell>
      <p className="text-sm text-destructive" role="alert">
        Não foi possível carregar esta solicitação de autorização:{" "}
        {String((error as Error)?.message ?? error)}
      </p>
    </ConsentShell>
  ),
});

function ConsentShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-creme px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marsala text-marsala-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-medium text-foreground">Bella IA</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Esthetic Center
            </p>
          </div>
        </div>
        <Card className="border-border/60 bg-card shadow-soft">
          <CardContent className="pt-6">{children}</CardContent>
        </Card>
      </div>
    </div>
  );
}

function ConsentPage() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [isBusy, setIsBusy] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const clientName = details?.client?.name ?? details?.client?.client_name ?? "um aplicativo";

  async function decide(approve: boolean) {
    setIsBusy(true);
    setError(null);
    const { data, error: decisionError } = approve
      ? await oauth().approveAuthorization(authorization_id)
      : await oauth().denyAuthorization(authorization_id);

    if (decisionError) {
      setIsBusy(false);
      setError(decisionError.message);
      return;
    }

    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setIsBusy(false);
      setError("O servidor de autorização não retornou um redirecionamento.");
      return;
    }

    window.location.href = target;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marsala text-marsala-foreground">
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h1 className="font-serif text-2xl font-medium text-foreground">Bella IA</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Esthetic Center
            </p>
          </div>
        </div>

        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-serif text-2xl font-medium">
              Conectar {clientName}
            </CardTitle>
            <CardDescription>
              Esta autorização permite que {clientName} utilize a Bella IA em seu nome, com as
              mesmas permissões da sua conta.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
            <div className="flex flex-col gap-2 sm:flex-row-reverse">
              <Button
                className="flex-1 focus-visible:ring-marsala"
                disabled={isBusy}
                onClick={() => decide(true)}
              >
                Autorizar
              </Button>
              <Button
                variant="outline"
                className="flex-1 focus-visible:ring-marsala"
                disabled={isBusy}
                onClick={() => decide(false)}
              >
                Recusar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
