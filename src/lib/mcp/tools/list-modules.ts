import { defineTool } from "@lovable.dev/mcp-js";

/**
 * Espelha a navegação do workspace administrativo.
 * Dado estrutural da aplicação — não é dado clínico nem mock de banco.
 */
const MODULES = [
  {
    slug: "dashboard",
    title: "Dashboard",
    path: "/dashboard",
    description: "Visão geral da operação da clínica.",
  },
  {
    slug: "conhecimento",
    title: "Central do Conhecimento",
    path: "/conhecimento",
    description: "Base de conhecimento clínico da Bella IA.",
  },
  {
    slug: "pacientes",
    title: "Pacientes",
    path: "/pacientes",
    description: "Cadastro e histórico de pacientes.",
  },
  {
    slug: "atendimentos",
    title: "Atendimento Clínico",
    path: "/atendimentos",
    description: "Registro e acompanhamento de atendimentos.",
  },
  {
    slug: "agenda",
    title: "Agenda",
    path: "/agenda",
    description: "Programação de consultas e procedimentos.",
  },
  {
    slug: "profissionais",
    title: "Profissionais",
    path: "/profissionais",
    description: "Equipe clínica e administrativa.",
  },
  {
    slug: "configuracoes",
    title: "Configurações",
    path: "/configuracoes",
    description: "Preferências da clínica e da plataforma.",
  },
] as const;

export default defineTool({
  name: "list_modules",
  title: "Listar módulos da plataforma",
  description:
    "Lista os módulos do workspace administrativo da Bella IA, com rota e descrição de cada um.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: () => ({
    content: [{ type: "text" as const, text: JSON.stringify(MODULES) }],
    structuredContent: { modules: MODULES },
  }),
});
