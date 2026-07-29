# Domínio: Agenda

Responsável pelo planejamento temporal da clínica: disponibilidade,
agendamentos, confirmações, remarcações e cancelamentos.

## Escopo
- Visões de calendário (dia, semana, profissional).
- Criação e alteração de agendamentos e seus status.
- Serviços de acesso às tabelas de agenda do BKG v3.0.

## Fora do escopo
- Registro clínico do atendimento realizado (domínio `attendance`).
- Cadastro de pacientes e profissionais (domínios correspondentes).

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; tipos derivados do schema gerado; não importar pastas internas de outros domínios.
