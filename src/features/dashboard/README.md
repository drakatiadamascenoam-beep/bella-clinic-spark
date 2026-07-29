# Domínio: Dashboard

Responsável pela visão consolidada da operação: indicadores (KPIs),
ações rápidas e atividades recentes.

## Escopo
- Agregação de métricas a partir dos demais domínios, sempre via camada de serviços.
- Custom hooks que expõem dados, carregamento, erro e disponibilidade (ver ADR-003).
- Componentes de apresentação puros, com Skeleton e Empty State.

## Fora do escopo
- Regra de negócio própria de outros domínios: o dashboard apenas agrega leituras.
- Persistência ou escrita de dados clínicos.

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; métricas indisponíveis exibem estado vazio; não importar pastas internas de outros domínios.
