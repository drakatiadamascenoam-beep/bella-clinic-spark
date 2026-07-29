import { auth, defineMcp } from "@lovable.dev/mcp-js";
import whoamiTool from "./tools/whoami";
import listModulesTool from "./tools/list-modules";
import getDashboardMetricsTool from "./tools/get-dashboard-metrics";

// O issuer OAuth precisa ser o host direto do Supabase (o proxy publicado
// quebra a validação RFC 8414). O project ref é inlined pelo Vite em build.
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "bella-ia-mcp",
  title: "Bella IA — Esthetic Center",
  version: "0.1.0",
  instructions:
    "Ferramentas da Bella Clinic Platform (Bella IA) da clínica Esthetic Center. Use `whoami` para confirmar o usuário conectado, `list_modules` para conhecer os módulos do workspace administrativo e `get_dashboard_metrics` para ler as métricas operacionais direto do banco. Todas as leituras respeitam as permissões do usuário autenticado.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [whoamiTool, listModulesTool, getDashboardMetricsTool],
});
