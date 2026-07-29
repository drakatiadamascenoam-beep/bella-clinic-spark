import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Redefinir senha — Bella IA" },
      { name: "description", content: "Defina uma nova senha de acesso à Bella Clinic Platform." },
      { property: "og:title", content: "Redefinir senha — Bella IA" },
      { property: "og:description", content: "Defina uma nova senha de acesso à Bella Clinic Platform." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const { updatePassword } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = React.useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const password = String(formData.get("password") ?? "");
    const confirm = String(formData.get("confirm") ?? "");

    if (password !== confirm) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await updatePassword(password);
      if (error) throw error;
      toast.success("Senha atualizada com sucesso.");
      navigate({ to: "/dashboard", replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar a senha.");
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
            <CardTitle className="font-serif text-2xl font-medium">Nova senha</CardTitle>
            <CardDescription>Defina uma nova senha para acessar a plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova senha</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm">Confirmar senha</Label>
                <Input
                  id="confirm"
                  name="confirm"
                  type="password"
                  placeholder="••••••••"
                  required
                  minLength={6}
                  className="rounded-lg"
                />
              </div>
              <Button
                type="submit"
                className="w-full rounded-lg bg-marsala text-marsala-foreground hover:bg-marsala-medium"
                disabled={isLoading}
              >
                {isLoading ? "Aguarde..." : "Salvar nova senha"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
