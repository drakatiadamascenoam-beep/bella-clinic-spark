## Sprint 2 — Central do Conhecimento → Protocolos Mestres

Atividades de MCP/OAuth/infra ficam encerradas. Esta sprint entrega apenas a listagem de Protocolos Mestres, seguindo o fluxo obrigatório UI → useProtocol() → protocol.service.ts → Supabase.

### Observação verificada sobre os dados
Consultei o schema `public` do backend agora: ele continua **sem nenhuma tabela** (nenhuma linha em `information_schema.columns`). Ou seja, a tabela de protocolos do Bella Knowledge Graph v3.0 ainda não está aplicada nesta instância. Como não posso modificar schema nem usar mocks, o serviço será escrito contra o contrato esperado (`protocols`) e, enquanto a fonte não existir, a tela exibirá o Empty State / "Fonte indisponível" — exatamente o comportamento já homologado no Dashboard. Assim que o schema for aplicado, a tela passa a listar dados reais sem alteração de código.

### Arquivos a criar
1. `src/services/protocol.service.ts` — server functions autenticadas (`requireSupabaseAuth`, RLS do usuário), no mesmo padrão de `dashboard.service.ts`:
   - `listProtocols({ search, status, category, page })` → `{ items, total, sourceUnavailable }`
   - `getProtocolById(id)` → detalhe completo ou `null`
   - Normalizadores tipados (sem `any`), tolerantes a ausência da fonte.
2. `src/hooks/useProtocol.ts` — TanStack Query: `useProtocols(filters)` e `useProtocol(id)`, únicas portas de entrada de dados da tela.
3. `src/features/knowledge/components/ProtocolStatusBadge.tsx` — badge de status (ativo, rascunho, arquivado) com tokens do Design System atual.
4. `src/features/knowledge/components/ProtocolFilters.tsx` — busca textual, filtro de status e de categoria (estado controlado pela página).
5. `src/features/knowledge/components/ProtocolTable.tsx` — tabela com Skeleton Loading, Empty State e clique na linha abrindo o detalhe.
6. `src/features/knowledge/components/ProtocolDetailSheet.tsx` — Sheet lateral com os dados do protocolo selecionado.
7. `src/features/knowledge/pages/ProtocolosPage.tsx` — composição da página (cabeçalho, filtros, tabela, sheet).
8. `src/routes/_authenticated/conhecimento/protocolos.tsx` — rota `/conhecimento/protocolos` com `head()` próprio, renderizando `ProtocolosPage`.

### Arquivos a alterar
- `src/routes/_authenticated/conhecimento.tsx` → passa a ser layout (`<Outlet />`), com o conteúdo atual movido para `src/routes/_authenticated/conhecimento/index.tsx`. Essa divisão é exigida pelo roteador para que exista uma rota filha `/conhecimento/protocolos`; nenhum conteúdo homologado é perdido.
- `src/routes/_authenticated/conhecimento/index.tsx` (novo) → mantém o placeholder atual e ganha um card de acesso a "Protocolos Mestres".
- `src/config/navigation.config.ts` → acrescenta `/conhecimento/protocolos` ao tipo de URL e ao breadcrumb (sem mudar a estrutura da Sidebar).

### Detalhes técnicos
- TypeScript estrito, sem `any`; interfaces exportadas para `Protocol`, `ProtocolStatus` e filtros.
- Nenhum componente acessa Supabase diretamente; toda leitura passa pelo hook → service.
- Filtros e paginação aplicados no servidor (`ilike`, `eq`, `range`), evitando filtragem no cliente.
- Reuso exclusivo de componentes shadcn já instalados (table, sheet, badge, input, select, skeleton) — nenhuma dependência nova.
- Não serão tocados: autenticação, `src/lib/mcp/*`, rotas OAuth, `vite.config.ts`, `package.json`, schema do banco.

### Entrega final
Ao concluir: lista de arquivos criados, lista de arquivos alterados, resultado do build de produção, resultado do typecheck e verificação de não-regressão das telas já homologadas (login, dashboard e demais módulos) via navegação automatizada.
