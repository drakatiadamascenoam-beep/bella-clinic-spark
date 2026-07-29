# Domínio: Professionals (Profissionais)

Responsável pelo corpo profissional da clínica: cadastro, especialidades,
registros de conselho, vínculo com a unidade e disponibilidade declarada.

## Escopo
- Listagem, detalhe e manutenção de profissionais.
- Especialidades e habilitações por profissional.
- Serviços de acesso às tabelas de profissionais do BKG v3.0.

## Fora do escopo
- Autenticação e provisionamento de contas (ver ADR-002 e `src/services/auth.service.ts`).
- Grade de horários e agendamentos (domínio `agenda`).

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; tipos derivados do schema gerado; não importar pastas internas de outros domínios.
