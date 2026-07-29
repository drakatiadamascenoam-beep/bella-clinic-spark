import { useAuth } from "@/hooks/use-auth";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Building2, LogOut, Search, User } from "lucide-react";
import { AppBreadcrumb } from "./app-breadcrumb";

export function AppHeader() {
  const { user, signOut } = useAuth();

  const initials = user?.email ? user.email.slice(0, 2).toUpperCase() : "EC";

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-card/80 px-4 backdrop-blur-md md:px-6">
      <SidebarTrigger className="-ml-1 text-foreground/70 hover:text-foreground focus-visible:ring-2 focus-visible:ring-marsala" />
      <Separator orientation="vertical" className="hidden h-6 sm:block" />

      <div className="min-w-0 flex-1">
        <AppBreadcrumb />
      </div>

      <div className="relative hidden w-64 lg:block">
        <Search
          className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <Input
          type="search"
          placeholder="Busca global"
          aria-label="Busca global"
          className="pl-9 focus-visible:ring-2 focus-visible:ring-marsala"
        />
      </div>

      <Button
        variant="ghost"
        size="icon"
        aria-label="Notificações"
        className="relative focus-visible:ring-2 focus-visible:ring-marsala"
      >
        <Bell className="h-4 w-4" />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-gold" aria-hidden="true" />
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            aria-label="Menu do usuário"
            className="relative h-9 w-9 rounded-full p-0 focus-visible:ring-2 focus-visible:ring-marsala"
          >
            <Avatar className="h-9 w-9 border border-border">
              <AvatarFallback className="bg-marsala text-marsala-foreground text-xs font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="truncate text-sm font-medium leading-none">
                {user?.email ?? "Convidado"}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.id ? "Usuário autenticado" : "Sessão não identificada"}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <User className="mr-2 h-4 w-4" />
            <span>Perfil</span>
          </DropdownMenuItem>
          <DropdownMenuItem disabled>
            <Building2 className="mr-2 h-4 w-4" />
            <span>Trocar Clínica</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Sair</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  );
}
