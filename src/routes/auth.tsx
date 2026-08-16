import * as React from "react";
import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { Sparkles, ArrowLeft, Mail, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

type Step = "methods" | "email" | "password" | "recover";
type Provider = "google" | "apple";

const REDIRECT_STORAGE_KEY = "bella.auth.redirect";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 48 48" className="h-4 w-4" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9 3.6l6.7-6.7C35.6 2.6 30.2 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.8 6.1C12.3 13.2 17.6 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.1 24.6c0-1.6-.1-3.1-.4-4.6H24v9h12.4c-.5 2.9-2.1 5.3-4.5 6.9l7 5.4c4.1-3.8 6.4-9.4 6.4-16.7z" />
      <path fill="#FBBC05" d="M10.4 28.7a14.5 14.5 0 010-9.4l-7.8-6.1a24 24 0 000 21.6l7.8-6.1z" />
      <path fill="#34A853" d="M24 48c6.2 0 11.5-2 15.3-5.6l-7-5.4c-2 1.4-4.7 2.3-8.3 2.3-6.4 0-11.7-3.7-13.6-9.1l-7.8 6.1C6.5 42.6 14.6 48 24 48z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 384 512" className="h-4 w-4 fill-current" aria-hidden="true">
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C64.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z" />
    </svg>
  );
}

function AuthPage() {
  const { signIn, resetPassword, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const search = useSearch({ from: "/auth" }) as { redirect?: string };

  const [step, setStep] = React.useState<Step>("methods");
  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [pendingProvider, setPendingProvider] = React.useState<Provider | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  const intendedPath = React.useMemo(() => {
    const fromSearch = search.redirect;
    if (fromSearch && fromSearch.startsWith("/") && !fromSearch.startsWith("//")) return fromSearch;
    return "/dashboard";
  }, [search.redirect]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    window.sessionStorage.setItem(REDIRECT_STORAGE_KEY, intendedPath);
  }, [intendedPath]);

  React.useEffect(() => {
    if (!isAuthenticated) return;
    const stored =
      typeof window !== "undefined" ? window.sessionStorage.getItem(REDIRECT_STORAGE_KEY) : null;
    const target = stored && stored.startsWith("/") && !stored.startsWith("//") ? stored : intendedPath;
    if (typeof window !== "undefined") window.sessionStorage.removeItem(REDIRECT_STORAGE_KEY);
    navigate({ to: target, replace: true });
  }, [isAuthenticated, intendedPath, navigate]);

  function friendlyError(cause: unknown): string {
    const message = cause instanceof Error ? cause.message.toLowerCase() : "";
    if (message.includes("invalid login credentials")) {
      return "E-mail ou senha incorretos. Verifique e tente novamente.";
    }
    if (message.includes("email not confirmed")) {
      return "Sua conta ainda não foi confirmada. Procure a administração.";
    }
    if (message.includes("rate") || message.includes("too many")) {
      return "Muitas tentativas em pouco tempo. Aguarde alguns instantes.";
    }
    if (message.includes("provider") || message.includes("unsupported")) {
      return "Este método de acesso está temporariamente indisponível.";
    }
    if (message.includes("cancel") || message.includes("closed") || message.includes("popup")) {
      return "Acesso cancelado. Você pode tentar novamente quando quiser.";
    }
    return "Não foi possível concluir o acesso. Tente novamente em instantes.";
  }

  async function handleOAuth(provider: Provider) {
    setError(null);
    setPendingProvider(provider);
    try {
      const result = await lovable.auth.signInWithOAuth(provider, {
        redirect_uri: window.location.origin,
      });
      if (result.error) throw new Error(String(result.error));
      if (result.redirected) return;
    } catch (cause) {
      const message = friendlyError(cause);
      setError(message);
      toast.error(message);
    } finally {
      setPendingProvider(null);
    }
  }

  function handleEmailStep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      setError("Informe um e-mail válido.");
      return;
    }
    setEmail(value);
    setStep("password");
  }

  async function handlePasswordStep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const password = String(new FormData(event.currentTarget).get("password") ?? "");

    setIsLoading(true);
    try {
      const { error: signInError } = await signIn(email, password);
      if (signInError) throw signInError;
      toast.success("Acesso autorizado");
    } catch (cause) {
      const message = friendlyError(cause);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRecoverStep(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      const { error: recoverError } = await resetPassword(email);
      if (recoverError) throw recoverError;
      toast.success("Se houver conta com este e-mail, enviaremos o link de redefinição.");
      setStep("password");
    } catch (cause) {
      const message = friendlyError(cause);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }

  const heading =
    step === "methods"
      ? "Bem-vinda à Bella IA"
      : step === "email"
        ? "Entre com seu e-mail"
        : step === "password"
          ? "Confirme sua senha"
          : "Recuperar senha";

  const subheading =
    step === "methods"
      ? "Acesse sua plataforma de gestão, segurança e inteligência clínica."
      : step === "email"
        ? "Informe o e-mail corporativo cadastrado pela administração."
        : step === "password"
          ? email
          : "Enviaremos um link de redefinição para o seu e-mail.";

  return (
    <div className="flex min-h-screen items-center justify-center bg-creme px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-10 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-marsala text-marsala-foreground">
            <Sparkles className="h-6 w-6" aria-hidden="true" />
          </div>
          <div className="text-center">
            <p className="font-serif text-xl font-medium text-foreground">Bella IA</p>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Esthetic Center
            </p>
          </div>
        </div>

        <Card className="border-border/60 bg-card shadow-soft">
          <CardHeader className="space-y-2 text-center">
            <CardTitle className="font-serif text-2xl font-medium">{heading}</CardTitle>
            <CardDescription>{subheading}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            {error && (
              <p
                role="alert"
                aria-live="polite"
                className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-foreground"
              >
                {error}
              </p>
            )}

            {step === "methods" && (
              <div className="space-y-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth("google")}
                  disabled={pendingProvider !== null}
                  aria-label="Continuar com Google"
                  className="h-11 w-full justify-center gap-3 rounded-lg border-border/70 focus-visible:ring-marsala"
                >
                  {pendingProvider === "google" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <GoogleIcon />
                  )}
                  Continuar com Google
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOAuth("apple")}
                  disabled={pendingProvider !== null}
                  aria-label="Continuar com Apple"
                  className="h-11 w-full justify-center gap-3 rounded-lg border-border/70 focus-visible:ring-marsala"
                >
                  {pendingProvider === "apple" ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <AppleIcon />
                  )}
                  Continuar com Apple
                </Button>

                <div className="flex items-center gap-3 py-1">
                  <span className="h-px flex-1 bg-border" />
                  <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground">ou</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <Button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setStep("email");
                  }}
                  aria-label="Continuar com e-mail"
                  className="h-11 w-full justify-center gap-3 rounded-lg bg-marsala text-marsala-foreground hover:bg-marsala-medium focus-visible:ring-marsala"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  Continuar com e-mail
                </Button>
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailStep} className="space-y-4" noValidate>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Digite seu e-mail"
                    className="h-11 rounded-lg focus-visible:ring-marsala"
                  />
                </div>
                <Button
                  type="submit"
                  className="h-11 w-full rounded-lg bg-marsala text-marsala-foreground hover:bg-marsala-medium focus-visible:ring-marsala"
                >
                  Continuar
                </Button>
              </form>
            )}

            {step === "password" && (
              <form onSubmit={handlePasswordStep} className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <Label htmlFor="password">Senha</Label>
                    <button
                      type="button"
                      onClick={() => {
                        setError(null);
                        setStep("recover");
                      }}
                      className="py-1.5 text-xs font-medium text-marsala hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala focus-visible:ring-offset-2"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    autoFocus
                    required
                    minLength={6}
                    placeholder="••••••••"
                    className="h-11 rounded-lg focus-visible:ring-marsala"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg bg-marsala text-marsala-foreground hover:bg-marsala-medium focus-visible:ring-marsala"
                >
                  {isLoading ? "Aguarde..." : "Entrar"}
                </Button>
              </form>
            )}

            {step === "recover" && (
              <form onSubmit={handleRecoverStep} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="recover-email">E-mail</Label>
                  <Input
                    id="recover-email"
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="Digite seu e-mail"
                    required
                    className="h-11 rounded-lg focus-visible:ring-marsala"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="h-11 w-full rounded-lg bg-marsala text-marsala-foreground hover:bg-marsala-medium focus-visible:ring-marsala"
                >
                  {isLoading ? "Enviando..." : "Enviar link de redefinição"}
                </Button>
              </form>
            )}

            {step !== "methods" && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setStep(step === "password" || step === "recover" ? "email" : "methods");
                }}
                className="mx-auto flex items-center gap-1.5 py-1.5 text-sm text-muted-foreground hover:text-foreground focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-marsala focus-visible:ring-offset-2"
              >
                <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
                Voltar
              </button>
            )}

            <p className="text-center text-sm text-muted-foreground">
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
