import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createProfissional,
  getProfissionalById,
  getProfissionais,
  updateProfissional,
} from "../services/professional.service";
import type { ProfessionalFormData } from "../types/professional-form.types";
import type {
  Professional,
  ProfessionalFiltersInput,
  ProfessionalListResult,
  ProfessionalUpdateInput,
} from "../types/professional.types";

/**
 * Única porta de entrada de dados de Profissionais.
 * UI → useProfissionais/useProfissional → professional.service.ts → Supabase.
 */

export const professionalKeys = {
  all: ["profissionais"] as const,
  lists: () => ["profissionais", "list"] as const,
  list: (filters: ProfessionalFiltersInput) => ["profissionais", "list", filters] as const,
  detail: (id: string) => ["profissionais", "detail", id] as const,
};

export function useProfissionais(filters: ProfessionalFiltersInput) {
  const fetchProfissionais = useServerFn(getProfissionais);

  return useQuery<ProfessionalListResult>({
    queryKey: professionalKeys.list(filters),
    queryFn: () => fetchProfissionais({ data: filters }),
    staleTime: 30_000,
  });
}

export function useProfissional(id: string | null) {
  const fetchProfissional = useServerFn(getProfissionalById);

  return useQuery<Professional | null>({
    queryKey: professionalKeys.detail(id ?? ""),
    queryFn: () => fetchProfissional({ data: { id: id as string } }),
    enabled: id !== null,
    staleTime: 30_000,
  });
}

export function useCreateProfissional() {
  const queryClient = useQueryClient();
  const create = useServerFn(createProfissional);

  return useMutation<Professional, Error, ProfessionalFormData>({
    mutationFn: (values) => create({ data: values }),
    onSuccess: (professional) => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all });
      queryClient.setQueryData(professionalKeys.detail(professional.id), professional);
    },
  });
}

export function useUpdateProfissional() {
  const queryClient = useQueryClient();
  const update = useServerFn(updateProfissional);

  return useMutation<Professional, Error, ProfessionalUpdateInput>({
    mutationFn: (values) => update({ data: values }),
    onSuccess: (professional) => {
      queryClient.invalidateQueries({ queryKey: professionalKeys.all });
      queryClient.setQueryData(professionalKeys.detail(professional.id), professional);
    },
  });
}
