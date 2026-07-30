# Domínio: Agenda Clínica (`schedule`)

Responsável pelo planejamento temporal da clínica: compromissos, conflitos de
horário, ciclo de vida do agendamento e encaminhamento de contexto para o
Atendimento Clínico.

## Escopo
- Visões da agenda do dia (lista/tabela e timeline).
- Criação de compromissos com checagem determinística de conflito.
- Transições de status (AGENDADO → CONFIRMADO → EM_ATENDIMENTO → CONCLUIDO).
- Encaminhamento de contexto ao módulo `attendance` (sem criar registros).

## Fora do escopo
- Registro clínico do atendimento realizado (domínio `attendance`).
- Cadastro de pacientes, protocolos e profissionais (domínios correspondentes).

## Estrutura
- `domain/` — regras puras (status, máquina de estados, conflitos)
- `types/` — contratos de domínio, schema Zod e camada de apresentação
- `mappers/` — schema físico ↔ contrato de domínio
- `services/` — server functions (acesso a dados)
- `hooks/` — estado e orquestração (TanStack Query)
- `components/` — UI específica do domínio
- `pages/` — composição de tela usada pela rota `/agenda`

Regras: sem dados mockados; nenhum componente React importa Supabase, `domain/`
ou `mappers/`; a Agenda consome apenas o contrato público de `attendance`.
