import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  changeAtendimentoStatus,
  createAtendimento,
  getAtendimentoById,
  getAtendimentos,
  updateAtendimento,
} from "../services/attendance.service";
import type { AttendanceFormData } from "../types/attendance-form.types";
import type {
  Attendance,
  AttendanceFiltersInput,
  AttendanceListResult,
  AttendanceStatusChangeInput,
  AttendanceUpdateInput,
} from "../types/attendance.types";

/**
 * Única porta de entrada de dados de Atendimentos.
 * UI → useAtendimentos/useAtendimento → attendance.service.ts → Supabase.
 */

export const attendanceKeys = {
  all: ["atendimentos"] as const,
  lists: () => ["atendimentos", "list"] as const,
  list: (filters: AttendanceFiltersInput) => ["atendimentos", "list", filters] as const,
  detail: (id: string) => ["atendimentos", "detail", id] as const,
};

export function useAtendimentos(filters: AttendanceFiltersInput) {
  const fetchAtendimentos = useServerFn(getAtendimentos);

  return useQuery<AttendanceListResult>({
    queryKey: attendanceKeys.list(filters),
    queryFn: () => fetchAtendimentos({ data: filters }),
    staleTime: 30_000,
  });
}

export function useAtendimento(id: string | null) {
  const fetchAtendimento = useServerFn(getAtendimentoById);

  return useQuery<Attendance | null>({
    queryKey: attendanceKeys.detail(id ?? ""),
    queryFn: () => fetchAtendimento({ data: { id: id as string } }),
    enabled: id !== null,
    staleTime: 30_000,
  });
}

export function useCreateAtendimento() {
  const queryClient = useQueryClient();
  const create = useServerFn(createAtendimento);

  return useMutation<Attendance, Error, AttendanceFormData>({
    mutationFn: (values) => create({ data: values }),
    onSuccess: (attendance) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.setQueryData(attendanceKeys.detail(attendance.id), attendance);
    },
  });
}

export function useUpdateAtendimento() {
  const queryClient = useQueryClient();
  const update = useServerFn(updateAtendimento);

  return useMutation<Attendance, Error, AttendanceUpdateInput>({
    mutationFn: (values) => update({ data: values }),
    onSuccess: (attendance) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(attendance.id) });
    },
  });
}

export function useChangeAtendimentoStatus() {
  const queryClient = useQueryClient();
  const change = useServerFn(changeAtendimentoStatus);

  return useMutation<Attendance, Error, AttendanceStatusChangeInput>({
    mutationFn: (input) => change({ data: input }),
    onSuccess: (attendance) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: attendanceKeys.detail(attendance.id) });
    },
  });
}
