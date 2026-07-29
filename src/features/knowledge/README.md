# Domínio: Knowledge (Base de Conhecimento)

Responsável pela base de conhecimento clínico da Bella IA sobre o Bella Knowledge Graph v3.0:
protocolos, procedimentos, ativos, contraindicações e relações entre entidades do grafo.

## Escopo
- Consulta, busca e navegação por entidades de conhecimento.
- Visualização de relações do grafo e conteúdos de referência.
- Serviços de leitura sobre as tabelas de conhecimento do BKG v3.0.

## Fora do escopo
- Dados de pacientes, atendimentos ou agenda (ver domínios correspondentes).
- Componentes genéricos de UI (ficam em `src/components/ui` e `src/components/shared`).

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; tipos derivados do schema gerado; não importar pastas internas de outros domínios.
