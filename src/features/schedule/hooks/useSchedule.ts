import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createAgendamento,
  getAgendamentoById,
  getAgendamentos,
  updateAgendamentoStatus,
} from "../services/schedule.service";
import type { ScheduleFormData } from "../types/schedule-form.types";
import type {
  Appointment,
  ScheduleFiltersInput,
  ScheduleListResult,
  ScheduleStatusChangeInput,
} from "../types/schedule.types";

/**
 * Única porta de entrada de dados da Agenda.
 * UI → useAgendamentos/useAgendamento → schedule.service.ts → Supabase.
 */

export const scheduleKeys = {
  all: ["agendamentos"] as const,
  lists: () => ["agendamentos", "list"] as const,
  list: (filters: ScheduleFiltersInput) => ["agendamentos", "list", filters] as const,
  detail: (id: string) => ["agendamentos", "detail", id] as const,
};

export function useAgendamentos(filters: ScheduleFiltersInput) {
  const fetchAgendamentos = useServerFn(getAgendamentos);

  return useQuery<ScheduleListResult>({
    queryKey: scheduleKeys.list(filters),
    queryFn: () => fetchAgendamentos({ data: filters }),
    staleTime: 30_000,
  });
}

export function useAgendamento(id: string | null) {
  const fetchAgendamento = useServerFn(getAgendamentoById);

  return useQuery<Appointment | null>({
    queryKey: scheduleKeys.detail(id ?? ""),
    queryFn: () => fetchAgendamento({ data: { id: id as string } }),
    enabled: id !== null,
    staleTime: 30_000,
  });
}

export function useCreateAgendamento() {
  const queryClient = useQueryClient();
  const create = useServerFn(createAgendamento);

  return useMutation<Appointment, Error, ScheduleFormData>({
    mutationFn: (values) => create({ data: values }),
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.setQueryData(scheduleKeys.detail(appointment.id), appointment);
    },
  });
}

export function useUpdateAgendamentoStatus() {
  const queryClient = useQueryClient();
  const changeStatus = useServerFn(updateAgendamentoStatus);

  return useMutation<Appointment, Error, ScheduleStatusChangeInput>({
    mutationFn: (values) => changeStatus({ data: values }),
    onSuccess: (appointment) => {
      queryClient.invalidateQueries({ queryKey: scheduleKeys.all });
      queryClient.setQueryData(scheduleKeys.detail(appointment.id), appointment);
    },
  });
}
