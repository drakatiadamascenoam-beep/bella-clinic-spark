## Diagnóstico prévio (verificado agora)

- `src/integrations/supabase/types.ts` expõe `public.Tables = never` — o schema gerado continua **vazio**. Não há `agendamentos`, `agenda`, `compromissos` nem `appointments`.
- Consequência: mesma estratégia validada nas Sprints 5 e 6 — mapper tolerante a aliases físicos, serviço defensivo e estado explícito **"Fonte de dados indisponível (Aguardando BKG v3.0)"**. Nenhuma persistência simulada, nenhum mock.
- `src/features/agenda/` existe apenas como scaffold vazio (README + `.gitkeep`). Como a Sprint pede `/src/features/schedule`, o scaffold `agenda` será removido para não gerar código morto/duplicidade de domínio.
- `src/routes/_authenticated/agenda.tsx` hoje renderiza `PagePlaceholder` — será apontado para `AgendaPage`.

## O que será construído

### 1. Domínio puro — `src/features/schedule/domain/`
- `schedule-status.ts`: `SCHEDULE_STATUS` (AGENDADO, CONFIRMADO, EM_ATENDIMENTO, CONCLUIDO, CANCELADO, FALTA), labels, normalização determinística de valores desconhecidos.
- `schedule-flow.ts`: máquina de estados exatamente conforme especificado, com `canTransition`, `availableTransitions`, `applyTransition` (erro determinístico em transição inválida) e estados terminais (CONCLUIDO, CANCELADO, FALTA).
- `schedule-conflict.ts`: cálculo de intervalo (início + duração), duração mínima/máxima (15–240 min), detecção de sobreposição contra a lista de compromissos do dia, ignorando cancelados/faltas, e mensagens explicativas de conflito.

Sem React, sem TanStack Query, sem Supabase.

### 2. Contratos, Zod e mapper
- `types/schedule-form.types.ts`: schema Zod (`paciente_id` obrigatório, `protocolo_id` opcional, `profissional_id` opcional — enviado apenas se existir no schema físico, `data_hora_inicio` obrigatório, `duracao_minutos` com padrão 60 e presets 30/60, `observacoes` opcional) + defaults.
- `types/schedule.types.ts`: modelo de domínio `Appointment` (camelCase), filtros (data, status), `ScheduleListResult` com `sourceUnavailable`.
- `mappers/schedule.mapper.ts`: tradução única entre colunas físicas (com aliases) e o contrato; `SCHEDULE_TABLE`, parsers de input, payload de escrita, lista vazia.

### 3. Serviço e hooks
- `services/schedule.service.ts`: server functions (`getAgendamentos`, `getAgendamentoById`, `createAgendamento`, `updateAgendamentoStatus`) com `requireSupabaseAuth`, wrapper fino, orquestrando mapper + domínio (validação de conflito no servidor antes de inserir; transição validada por `schedule-flow`). Leitura falha → `sourceUnavailable: true`; escrita falha → erro explícito.
- `hooks/useSchedule.ts`: `useAgendamentos`, `useAgendamento`, `useCreateAgendamento`, `useUpdateAgendamentoStatus`, com invalidação da chave `agendamentos`.

### 4. UI — `src/features/schedule/components/`
- `ScheduleView.tsx`: alterna Lista/Tabela do dia e Timeline por faixa horária (componente de apresentação puro).
- `ScheduleFilters.tsx`: Hoje / Amanhã / seletor de data (Popover + Calendar shadcn) e filtro por status.
- `ScheduleFormSheet.tsx` + `ScheduleFormFields.tsx` + `ScheduleSelectors.tsx`: drawer de novo agendamento, seletores defensivos reutilizando `usePacientes` e `useProtocols`, data/hora, duração, Skeleton, Spinner, Dirty State e Anti-Double Submit. Conflito detectado → bloqueia o envio, destaca o campo de horário, exibe alerta amigável e **preserva os dados preenchidos**.
- `ScheduleDetailSheet.tsx`: detalhes, transições de status válidas e ação **"Iniciar Atendimento"** que apenas encaminha contexto (paciente, protocolo, data) — nenhuma criação automática; a sessão só nasce após o usuário confirmar no formulário de Atendimento.
- `ScheduleStatusBadge.tsx` e `schedule-format.ts` para consistência visual com as Sprints 2–6.

### 5. Página e rota
- `pages/AgendaPage.tsx`: título "Agenda Clínica", botão "Novo Agendamento", Skeleton, Empty State elegante, Error State com Retry — dentro do `AppShell` já existente.
- `src/routes/_authenticated/agenda.tsx`: passa a renderizar `AgendaPage` (head/SEO da rota preservado e refinado).

## Ponto técnico que exige sua ciência

O "Iniciar Atendimento" precisa **pré-preencher** o formulário de Atendimento. Hoje `AttendanceFormSheet` aceita apenas `attendance: Attendance | null`, sem entrada de valores iniciais. Para respeitar a regra de consumir só contratos públicos, farei:

- Criação de `src/features/attendance/index.ts` (barrel público) exportando `AttendanceFormSheet`, tipos e um novo tipo `AttendancePrefill`.
- Uma alteração **aditiva e retrocompatível** em `AttendanceFormSheet`: prop opcional `prefill?: AttendancePrefill`, usada apenas na abertura em modo criação. Nenhum comportamento atual muda.

Essas são as duas únicas modificações fora de `/src/features/schedule` além do registro da rota. Se preferir, posso em vez disso duplicar um formulário próprio na Agenda — mas isso geraria código redundante e divergência de validação clínica, então recomendo a via aditiva acima.

## Qualidade e validação

- Zero `any`, tipagem estrita, arquivos abaixo de ~300 linhas, componentes sem import de Supabase/Domain/Mapper.
- Build + `tsgo --noEmit` limpos.
- Verificação por varredura (`rg`) do checklist arquitetural e teste de fluxo integrado no preview via Playwright (Agenda → Detalhe → Iniciar Atendimento → formulário pré-preenchido sem gravação automática).
- Regressão das Sprints 1 a 6 checada nas rotas existentes.
