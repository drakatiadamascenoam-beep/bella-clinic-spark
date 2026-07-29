# Domínio: Attendance (Atendimentos)

Responsável pelo ciclo de vida do atendimento clínico: abertura, evolução,
procedimentos realizados, registros e encerramento.

## Escopo
- Listagem e detalhe de atendimentos.
- Registro de evolução e de procedimentos executados.
- Serviços de acesso às tabelas de atendimento do BKG v3.0.

## Fora do escopo
- Cadastro do paciente (domínio `patients`).
- Disponibilidade e marcação de horários (domínio `agenda`).

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; tipos derivados do schema gerado; não importar pastas internas de outros domínios.
