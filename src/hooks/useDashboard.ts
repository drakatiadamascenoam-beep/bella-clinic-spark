import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { getDashboardMetrics, type DashboardMetrics } from "@/services/dashboard.service";

export const dashboardQueryKey = ["dashboard", "metrics"] as const;

/**
 * Única porta de entrada de dados do Dashboard.
 * Componentes React nunca acessam o backend diretamente.
 */
export function useDashboard() {
  const fetchMetrics = useServerFn(getDashboardMetrics);

  return useQuery<DashboardMetrics>({
    queryKey: dashboardQueryKey,
    queryFn: () => fetchMetrics(),
    staleTime: 60_000,
  });
}
