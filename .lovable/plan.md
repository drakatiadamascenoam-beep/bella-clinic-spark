## Situação atual (verificada)

Boa parte da Sprint 1.1 já está no repositório:

- `/docs/adr` existe na raiz com ADR-001, ADR-002, ADR-003, ADR-004 e um `README.md` de índice — todos com Contexto, Decisão, Justificativa e Consequências.
- `/src/features` existe com os 7 domínios (`knowledge`, `patients`, `attendance`, `professionals`, `agenda`, `dashboard`, `settings`), cada um com `components/`, `hooks/`, `services/`, `pages/`, `types/` e `README.md`.

O que **falta** para fechar o escopo desta sprint é o item 3: as **Regras Arquiteturais** ainda não estão formalizadas em um documento próprio.

## O que será feito

### 1. ADR-005 — Regras Arquiteturais (`docs/adr/ADR-005-architectural-rules.md`)
Documento normativo com Contexto, Decisão, Justificativa e Consequências, formalizando:
- `src/components/**` contém apenas componentes compartilhados e agnósticos de domínio.
- `src/features/**` contém todo código específico de negócio.
- Nenhum componente React acessa Supabase diretamente.
- Fluxo obrigatório: **UI → Hooks → Services → Supabase**.
- Database First; Supabase como Single Source of Truth.
- TypeScript strict; `any` proibido; dados mockados proibidos.
- Exceção explícita e única já existente: o `AuthProvider` e o gate de rota autenticada consomem a sessão do cliente de auth diretamente (comportamento homologado, fora de escopo de alteração).

### 2. Atualização do índice
`docs/adr/README.md` passa a listar o ADR-005.

### 3. Relatório final
- Lista de arquivos criados e alterados.
- Árvore final de `/docs/adr` e `/src/features`.
- Build de produção sem erros.
- Verificação de não-regressão das telas da Sprint 1 (landing, `/auth`, dashboard e rotas de módulo) via navegação automatizada.
- Seção "Melhorias identificadas (não implementadas)" — apenas documentadas, ex.: regra de lint para barrar import de Supabase em componentes, e migração incremental de `src/services` para os domínios.

## Restrições respeitadas
Nenhum arquivo existente é movido; nenhuma tela homologada, autenticação, schema, conexão ou tabela é alterada; Sprint 2 não é iniciada. As únicas escritas são os dois arquivos de documentação acima.
