# ADR-003 — Métricas unificadas via Custom Hooks e desacoplamento da UI

- Status: Aceito
- Data: 2026-07-29

## Contexto

O Dashboard administrativo agrega indicadores de origens distintas (pacientes, atendimentos, agenda, profissionais). Se cada card consultar o backend por conta própria, surgem consultas duplicadas, estados de carregamento inconsistentes e regra de negócio espalhada por componentes de apresentação.

## Decisão

1. A leitura de métricas é centralizada em um **custom hook** (`useDashboard`), que orquestra o carregamento e expõe um contrato único: dados, estado de carregamento, erro e disponibilidade.
2. O hook consome **exclusivamente** a camada de serviços (`dashboard.service.ts`); nenhum componente acessa o cliente Supabase diretamente.
3. Componentes de UI (`KpiCard`, tabela de atendimentos recentes, ações rápidas) são **puramente apresentacionais**: recebem props, não buscam dados e não contêm regra de cálculo.
4. Todo painel trata explicitamente três estados: **carregando** (Skeleton), **vazio** (Empty State) e **erro/indisponível**.
5. Métricas indisponíveis nunca são substituídas por valores fictícios (coerente com o ADR-001).

## Justificativa

- Uma única fonte de estado por tela evita divergência entre cards.
- Facilita cache e revalidação (React Query) num ponto só.
- Componentes de apresentação tornam-se reutilizáveis e triviais de testar.
- Trocar a origem de uma métrica exige mudança apenas no serviço.

## Consequências

**Positivas**
- Estados de carregamento coerentes em toda a tela.
- Regra de agregação concentrada e auditável.
- Baixo custo para adicionar novos indicadores.

**Negativas / custos**
- O hook pode crescer; à medida que o domínio evolui deve ser dividido por área (`features/dashboard/hooks`).
- Um erro na agregação afeta a tela inteira, exigindo granularidade de erro por bloco no futuro.
