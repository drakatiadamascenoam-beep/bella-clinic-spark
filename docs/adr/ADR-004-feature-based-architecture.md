# ADR-004 — Arquitetura orientada a domínios (`/src/features`)

- Status: Aceito
- Data: 2026-07-29

## Contexto

Com a infraestrutura da Sprint 0.9 e o workspace administrativo da Sprint 1 concluídos, a aplicação passará a receber domínios clínicos completos (conhecimento, pacientes, atendimentos, profissionais, agenda, configurações). Uma organização por tipo técnico (`components/`, `hooks/`, `services/` globais) faria cada novo domínio espalhar arquivos por várias pastas, dificultando propriedade, revisão e remoção de funcionalidades.

## Decisão

1. Cada domínio de negócio vive em `src/features/<dominio>/`, com estrutura padrão:
   - `components/` — UI específica do domínio
   - `hooks/` — estado e orquestração do domínio
   - `services/` — acesso a dados do domínio (Supabase / server functions)
   - `pages/` — composições de tela consumidas pelas rotas
   - `types/` — tipos derivados do schema e view models do domínio
2. Domínios iniciais: `knowledge`, `patients`, `attendance`, `professionals`, `agenda`, `dashboard`, `settings`.
3. Fronteiras:
   - `src/components/shared` e `src/components/ui` contêm **apenas** elementos agnósticos de domínio.
   - `src/components/layout`, `src/routes`, `src/integrations`, `src/lib` permanecem transversais.
   - `src/routes/**` fica fino: a rota define metadados, carregamento e renderiza uma página do domínio.
4. Um domínio **não importa** pastas internas de outro domínio. O que precisar ser compartilhado sobe para uma camada compartilhada.
5. A migração do código existente é **incremental**: nada é movido nesta etapa; código novo já nasce dentro de `src/features`.

## Justificativa

- Alta coesão por domínio e baixo acoplamento entre domínios.
- Propriedade clara: uma funcionalidade cabe em uma pasta.
- Remoção ou substituição de um domínio é local e segura.
- Escala melhor que organização por tipo técnico à medida que o produto cresce.

## Consequências

**Positivas**
- Onboarding mais rápido e revisões menores.
- Caminho natural para divisão de código por rota/domínio.

**Negativas / custos**
- Convivência temporária de dois estilos (`src/services` legado e serviços por domínio) até a migração incremental terminar.
- Exige disciplina para não criar dependências cruzadas entre domínios.
- Risco de duplicação se elementos genuinamente compartilhados não forem promovidos a tempo.
