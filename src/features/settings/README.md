# Domínio: Settings (Configurações)

Responsável pelas preferências e parâmetros da plataforma: perfil do usuário,
dados da clínica, papéis e permissões, e preferências operacionais.

## Escopo
- Perfil do usuário autenticado e preferências de interface.
- Parâmetros da unidade/clínica.
- Administração de papéis e permissões (RBAC em tabela dedicada, ver ADR-002).

## Fora do escopo
- Fluxo de login e recuperação de senha (rotas `/auth` e `/reset-password`).
- Qualquer alteração de schema do banco (ver ADR-001).

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; tipos derivados do schema gerado; não importar pastas internas de outros domínios.
