## Sprint 1.1 — Consolidação Arquitetural

Criação apenas de documentação e scaffolding. Nenhum arquivo existente é movido, alterado ou removido; nenhuma mudança em banco, tipos ou conexões.

### 1. Governança técnica — `/docs/adr` (raiz, fora de `/src`)

Quatro ADRs em Markdown, cada um com as seções **Contexto**, **Decisão**, **Justificativa** e **Consequências**:

- `docs/adr/ADR-001-database-first.md` — Supabase como Single Source of Truth; congelamento do Bella Knowledge Graph v3.0; proibição de mocks e de alterações de schema pelo frontend.
- `docs/adr/ADR-002-authentication.md` — autenticação corporativa (credenciais emitidas pela administração), remoção do cadastro público, recuperação de senha, rotas protegidas pelo layout `_authenticated`.
- `docs/adr/ADR-003-dashboard.md` — métricas unificadas por custom hooks (`useDashboard`) sobre a camada de serviços; UI desacoplada (KpiCard, tabela, skeleton, empty state) sem acesso direto ao backend.
- `docs/adr/ADR-004-feature-based-architecture.md` — organização por domínios em `/src/features`; fronteira entre features e `/src/components/shared`, `/src/services`, `/src/routes`.

Também adiciono `docs/adr/README.md` como índice curto dos ADRs (opcional, ajuda navegação).

### 2. Scaffolding de domínios — `/src/features`

Sete domínios, cada um com as subpastas `components`, `hooks`, `services`, `pages`, `types` e um `README.md` descrevendo a responsabilidade do domínio, o que pertence e o que não pertence a ele:

```text
src/features/
  knowledge/      { components, hooks, services, pages, types } + README.md
  patients/       ...
  attendance/     ...
  professionals/  ...
  agenda/         ...
  dashboard/      ...
  settings/       ...
```

Detalhe técnico: Git não versiona pastas vazias, então cada subpasta recebe um `.gitkeep` para que a estrutura persista. Nenhum arquivo `.ts`/`.tsx` é criado — assim nada entra no grafo de build nem em `routeTree.gen.ts`.

### 3. Validação

Build de produção executado ao final para confirmar ausência de erros (esperado: nenhum impacto, já que nada executável foi adicionado).

Sprint 2 não é iniciada; aguardo aprovação no Gate.