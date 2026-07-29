import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import {
  createProtocol,
  getProtocolById,
  listProtocols,
  updateProtocol,
  type Protocol,
  type ProtocolFiltersInput,
  type ProtocolListResult,
} from "@/services/protocol.service";
import type { ProtocolFormValues } from "@/features/knowledge/types/protocol-form";

/**
 * Única porta de entrada de dados de Protocolos Mestres.
 * UI → useProtocols/useProtocol → protocol.service.ts → Supabase.
 */

export const protocolKeys = {
  all: ["protocols"] as const,
  lists: () => ["protocols", "list"] as const,
  list: (filters: ProtocolFiltersInput) => ["protocols", "list", filters] as const,
  detail: (id: string) => ["protocols", "detail", id] as const,
};


export function useProtocols(filters: ProtocolFiltersInput) {
  const fetchProtocols = useServerFn(listProtocols);

  return useQuery<ProtocolListResult>({
    queryKey: protocolKeys.list(filters),
    queryFn: () => fetchProtocols({ data: filters }),
    staleTime: 30_000,
  });
}

export function useProtocol(id: string | null) {
  const fetchProtocol = useServerFn(getProtocolById);

  return useQuery<Protocol | null>({
    queryKey: protocolKeys.detail(id ?? ""),
    queryFn: () => fetchProtocol({ data: { id: id as string } }),
    enabled: id !== null,
    staleTime: 30_000,
  });
}

export function useCreateProtocol() {
  const queryClient = useQueryClient();
  const create = useServerFn(createProtocol);

  return useMutation<Protocol, Error, ProtocolFormValues>({
    mutationFn: (values) => create({ data: values }),
    onSuccess: (protocol) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.lists() });
      queryClient.setQueryData(protocolKeys.detail(protocol.id), protocol);
    },
  });
}

export function useUpdateProtocol() {
  const queryClient = useQueryClient();
  const update = useServerFn(updateProtocol);

  return useMutation<Protocol, Error, ProtocolFormValues & { id: string }>({
    mutationFn: (values) => update({ data: values }),
    onSuccess: (protocol) => {
      queryClient.invalidateQueries({ queryKey: protocolKeys.lists() });
      queryClient.invalidateQueries({ queryKey: protocolKeys.detail(protocol.id) });
    },
  });
}
