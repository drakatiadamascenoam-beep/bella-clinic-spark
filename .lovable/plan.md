# Sprint 0.9 — Infraestrutura técnica da Bella Clinic Platform

## Objetivo
Entregar a base técnica da plataforma sem nenhuma funcionalidade de negócio. Ao final, o projeto deve compilar, ter autenticação Supabase funcional, design system da Esthetic Center aplicado, camada de serviços tipada e um layout shell vazio (sidebar + header + área principal).

## Premissas
- Stack: React 19 + TypeScript + TanStack Start + TanStack Query v5 + Tailwind CSS v4 + shadcn/ui.
- Backend: Lovable Cloud (Supabase) será a única fonte de verdade.
- O schema Bella Knowledge Graph v3.0 já existe no Supabase; não criarei migrations nem alterarei tabelas.
- Nenhum dado mockado ou hardcoded será utilizado.
- Perfis iniciais: ADMIN, PROFISSIONAL, RECEPCAO. A estrutura de RBAC será preparada, mas as regras detalhadas virão em sprints futuras.
- Identidade visual: Quiet Luxury, paleta Marsala/Gold/Creme/Marfim, fontes Cormorant Garamond + Inter.

## Etapas

### 1. Habilitar Lovable Cloud
- Ativar a integração Lovable Cloud no projeto para obter URL e chaves do Supabase.
- Configurar as variáveis de ambiente necessárias (cliente e servidor).

### 2. Estrutura oficial de pastas
Criar a organização base:

```
src/
  components/
    ui/              # primitives shadcn/ui customizados
    layout/          # AppSidebar, AppHeader, AppShell
  hooks/
    use-auth.ts      # acesso ao contexto de autenticação
    use-mobile.tsx   # já existe
  integrations/
    supabase/
      client.ts      # cliente browser
      auth-middleware.ts  # requireSupabaseAuth
      auth-attacher.ts    # anexar bearer token
      types.ts       # tipos Database gerados
  lib/
    utils.ts         # já existe (cn, etc.)
  routes/
    __root.tsx       # root com providers e layout global
    index.tsx        # landing pública
    auth.tsx         # login/cadastro
    _authenticated/
      route.tsx      # layout protegido (integração gerenciada)
      dashboard.tsx  # página vazia do shell
  services/
    auth.service.ts  # login, logout, recuperação de senha
    users.service.ts # perfil e roles
  styles.css         # design system
```

### 3. Design System — Quiet Luxury
- Atualizar `src/styles.css` com tokens semânticos oklch baseados na paleta oficial:
  - Marsala `#5C1F2E`
  - Marsala Médio `#7A2D3E`
  - Gold `#B08D6A`
  - Creme `#FAF8F5`
  - Marfim `#F4F1ED`
- Configurar `border-radius` para `rounded-xl` / `rounded-2xl`.
- Adicionar sombras suaves e espaçamento generoso.
- Carregar fontes Cormorant Garamond e Inter via `<link>` no `head()` do `__root.tsx`.
- Customizar componentes shadcn (Button, Card, Input, Sidebar) para refletir a identidade premium.

### 4. Supabase Client e Auth
- Criar cliente browser em `src/integrations/supabase/client.ts`.
- Criar middleware de autenticação `requireSupabaseAuth` para server functions.
- Criar `auth-attacher.ts` para anexar bearer token nas chamadas client-side.
- Gerar tipos TypeScript a partir do schema existente (`Database` types).
- Configurar `src/start.ts` para incluir o `attachSupabaseAuth` no `functionMiddleware`.

### 5. AuthProvider e QueryProvider
- Criar `AuthProvider` com contexto de sessão, signIn, signOut, signUp, resetPassword.
- Integrar `onAuthStateChange` no `__root.tsx` para invalidar router/query em mudanças de sessão.
- Manter `QueryClientProvider` já existente.
- Criar rotas públicas (`/`, `/auth`) e protegidas (`/_authenticated/*`).

### 6. Camada de serviços (/services)
- Criar estrutura inicial desacoplada da UI:
  - `auth.service.ts`: funções de autenticação.
  - `users.service.ts`: leitura de perfil/roles (server functions autenticadas).
- Todas as funções tipadas com Zod + TypeScript.
- Nenhuma lógica de negócio clínica será implementada.

### 7. Layout Shell vazio
- Criar `AppSidebar` com navegação placeholder (sem funcionalidades reais).
- Criar `AppHeader` com trigger do sidebar e área de usuário.
- Criar `AppShell` combinando sidebar + header + `<Outlet />`.
- Aplicar na rota autenticada (`/_authenticated/dashboard`).
- Garantir responsividade desktop-first e mini-sidebar colapsável.

### 8. Validação e build
- Executar `bun run build` para confirmar que o projeto compila sem erros.
- Verificar que não há imports proibidos (ex: `client.server` no cliente).
- Apresentar a estrutura de arquivos final e dependências instaladas.

## Critérios de aceitação
- [ ] Lovable Cloud ativado e variáveis de ambiente configuradas.
- [ ] Tipos `Database` do Supabase gerados e importáveis.
- [ ] Login com email/senha funcional (sem funcionalidades clínicas).
- [ ] Rotas autenticadas redirecionam para `/auth` quando não logado.
- [ ] Layout shell renderiza sidebar, header e área principal vazia.
- [ ] Design system com paleta e tipografia da Esthetic Center aplicados.
- [ ] `bun run build` executa sem erros.
- [ ] Nenhum dado mockado ou hardcoded foi adicionado.

## Pergunta para confirmação antes de iniciar
O schema Bella Knowledge Graph v3.0 já inclui as tabelas `profiles` e `user_roles` (ou equivalente) para suportar o RBAC? Caso contrário, precisarei que você forneça as migrations correspondentes, pois não podemos criar/modificar tabelas sem sua aprovação.