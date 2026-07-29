import * as React from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Entrar — Bella IA" },
      { name: "description", content: "Acesse a Bella Clinic Platform da Esthetic Center." },
      { property: "og:title", content: "Entrar — Bella IA" },
      { property: "og:description", content: "Acesse a Bella Clinic Platform da Esthetic Center." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { signIn, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { redirect?: string };
  const [isLoading, setIsLoading] = React.useState(false);
  const [mode, setMode] = React.useState<"signin" | "recover">("signin");

  React.useEffect(() => {
    if (isAuthenticated) {
      const redirect = search.redirect && search.redirect.startsWith("/") ? search.redirect : "/dashboard";
      navigate({ to: redirect, replace: true });
    }
  }, [isAuthenticated, navigate, search.redirect]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");

    setIsLoading(true);
    try {
      if (mode === "signin") {
        const { error } = await signIn(email, password);
        if (error) throw error;
        toast.success("Login realizado com sucesso");
      } else {
        const { error } = await resetPassword(email);
        if (error) throw error;
        toast.success("Enviamos um link de redefinição para o seu e-mail.");
        setMode("signin");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erro na autenticação");
    } finally {
      setIsLoading(false);
    }
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
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Esthetic Center</p>
          </div>
        </div>

        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="font-serif text-2xl font-medium">
              {mode === "signin" ? "Bem-vinda de volta" : "Recuperar senha"}
            </CardTitle>
            <CardDescription>
              {mode === "signin"
                ? "Entre com suas credenciais para acessar a plataforma."
                : "Informe seu e-mail para receber o link de redefinição."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="Digite seu e-mail"
                  required
                  className="rounded-lg focus-visible:ring-marsala"
                />
              </div>
              {mode === "signin" && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => setMode("recover")}
                      className="py-1.5 text-xs font-medium text-marsala hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala focus-visible:ring-offset-2"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    required
                    minLength={6}
                    className="rounded-lg focus-visible:ring-marsala"
                  />
                </div>
              )}
              <Button
                type="submit"
                className="w-full rounded-lg bg-marsala text-marsala-foreground hover:bg-marsala-medium focus-visible:ring-marsala"
                disabled={isLoading}
              >
                {isLoading ? "Aguarde..." : mode === "signin" ? "Entrar" : "Enviar link de redefinição"}
              </Button>
            </form>

            {mode === "recover" && (
              <p className="mt-4 text-center text-sm text-muted-foreground">
                <button
                  type="button"
                  onClick={() => setMode("signin")}
                  className="font-medium text-marsala hover:underline"
                >
                  Voltar para o login
                </button>
              </p>
            )}

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Primeiro acesso? Solicite credenciais à administração.
            </p>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Esthetic Center. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
