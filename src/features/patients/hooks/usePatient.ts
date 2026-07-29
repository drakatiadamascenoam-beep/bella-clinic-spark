import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createPaciente,
  getPacienteById,
  getPacientes,
  updatePaciente,
} from "../services/patient.service";
import type {
  Patient,
  PatientFiltersInput,
  PatientListResult,
  PatientUpdateInput,
} from "../types/patient.types";
import type { PatientFormData } from "../types/patient-form.types";

/**
 * Única porta de entrada de dados de Pacientes.
 * UI → usePacientes/usePaciente → patient.service.ts → Supabase.
 */

export const patientKeys = {
  all: ["pacientes"] as const,
  lists: () => ["pacientes", "list"] as const,
  list: (filters: PatientFiltersInput) => ["pacientes", "list", filters] as const,
  detail: (id: string) => ["pacientes", "detail", id] as const,
};

export function usePacientes(filters: PatientFiltersInput) {
  const fetchPacientes = useServerFn(getPacientes);

  return useQuery<PatientListResult>({
    queryKey: patientKeys.list(filters),
    queryFn: () => fetchPacientes({ data: filters }),
    staleTime: 30_000,
  });
}

export function usePaciente(id: string | null) {
  const fetchPaciente = useServerFn(getPacienteById);

  return useQuery<Patient | null>({
    queryKey: patientKeys.detail(id ?? ""),
    queryFn: () => fetchPaciente({ data: { id: id as string } }),
    enabled: id !== null,
    staleTime: 30_000,
  });
}

export function useCreatePaciente() {
  const queryClient = useQueryClient();
  const create = useServerFn(createPaciente);

  return useMutation<Patient, Error, PatientFormData>({
    mutationFn: (values) => create({ data: values }),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.setQueryData(patientKeys.detail(patient.id), patient);
    },
  });
}

export function useUpdatePaciente() {
  const queryClient = useQueryClient();
  const update = useServerFn(updatePaciente);

  return useMutation<Patient, Error, PatientUpdateInput>({
    mutationFn: (values) => update({ data: values }),
    onSuccess: (patient) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patient.id) });
    },
  });
}
