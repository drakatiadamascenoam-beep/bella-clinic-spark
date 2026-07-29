# ADR-005 — Regras arquiteturais congeladas

- Status: Aceito
- Data: 2026-07-29

## Contexto

Ao final da Sprint 1.1 a arquitetura base da Bella IA está congelada: infraestrutura
técnica (Sprint 0.9), workspace administrativo (Sprint 1) e scaffolding de domínios
com governança documental (Sprint 1.1). A partir da Sprint 2 vários domínios clínicos
passarão a ser implementados em paralelo sobre o Bella Knowledge Graph v3.0.

Sem regras explícitas e verificáveis, o crescimento rápido tende a produzir os desvios
clássicos: componentes consultando o banco diretamente, lógica de negócio em pastas
compartilhadas, tipos afrouxados com `any` e telas alimentadas por dados fictícios
"temporários". Cada um desses desvios é barato de introduzir e caro de reverter.

## Decisão

As regras abaixo são normativas e valem para todo código novo do projeto.

### 1. Fronteiras de pastas

- `src/components/**` contém **apenas** componentes compartilhados e agnósticos de
  domínio (`ui/`, `shared/`, `layout/`, `providers/`).
- `src/features/<dominio>/**` contém **todo** código específico de negócio:
  `components/`, `hooks/`, `services/`, `pages/`, `types/`.
- `src/routes/**` permanece fino: define metadados, `head()`, carregamento e renderiza
  uma página do domínio.
- Um domínio não importa pastas internas de outro domínio; o que for genuinamente
  comum sobe para a camada compartilhada.

### 2. Fluxo de dados obrigatório

```text
UI (components/pages)  →  Hooks (TanStack Query)  →  Services  →  Supabase
```

- Nenhum componente React acessa Supabase diretamente.
- Componentes consomem **apenas** hooks; hooks consomem **apenas** services;
  services são o único ponto de contato com Supabase / server functions.
- Cache, estados de carregamento e erro pertencem à camada de hooks.

**Exceção única e já homologada:** `src/components/providers/auth-provider.tsx` e o
gate `src/routes/_authenticated/route.tsx` leem a sessão diretamente do cliente de
auth. A sessão é estado de infraestrutura, não dado de domínio, e o comportamento está
homologado — nenhuma nova exceção pode ser criada sem um novo ADR.

### 3. Dados

- **Database First**: o schema do Bella Knowledge Graph v3.0 é a origem do modelo;
  o código se adapta ao banco, nunca o contrário.
- **Supabase é Single Source of Truth**: sem cópias paralelas de verdade no frontend.
- **Proibido dado mockado ou hardcoded** em qualquer tela ou service. Quando a fonte
  não estiver disponível, a UI exibe estado vazio ou "fonte indisponível".

### 4. Tipagem

- TypeScript em modo strict.
- **`any` é proibido.** Use os tipos gerados do schema, `unknown` com narrowing, ou
  generics. Type assertions só são aceitas como ponte temporária, sempre comentadas e
  associadas a uma pendência de schema.

## Justificativa

- O fluxo único UI → Hooks → Services → Supabase torna cada camada testável e
  substituível, e concentra segurança e política de acesso em um lugar só.
- A separação `components/` vs `features/` mantém o núcleo compartilhado pequeno e
  evita que regras clínicas vazem para peças reutilizáveis.
- Database First e a proibição de mocks impedem que a UI evolua sobre premissas falsas
  do modelo de dados — risco alto em domínio clínico.
- Strict + ausência de `any` transforma mudanças de schema em erros de compilação em
  vez de falhas silenciosas em produção.

## Consequências

**Positivas**
- Revisões objetivas: a violação de regra é apontável sem debate de estilo.
- Domínios podem crescer em paralelo com baixo risco de colisão.
- Troca de camada de dados fica restrita aos services.

**Negativas / custos**
- Mais arquivos por funcionalidade: um hook e um service mesmo para leituras simples.
- Convivência temporária entre `src/services` legado e services por domínio até a
  migração incremental terminar.
- Sem mocks, telas de domínios ainda não modelados no banco exibem estados vazios
  durante o desenvolvimento.

**Não implementado nesta sprint (registrado como melhoria futura)**
- Regra de ESLint que barre importações de `@/integrations/supabase/*` fora de
  `**/services/**`, tornando a regra 2 executável em CI.
- Migração incremental de `src/services/dashboard.service.ts`,
  `auth.service.ts` e `users.service.ts` para os domínios correspondentes.
