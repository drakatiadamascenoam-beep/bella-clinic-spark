import { defineTool } from "@lovable.dev/mcp-js";
import { unauthenticated } from "../supabase";

export default defineTool({
  name: "whoami",
  title: "Identidade do usuário conectado",
  description:
    "Retorna o usuário da Bella IA autenticado nesta conexão (id e e-mail). Útil para confirmar o vínculo da integração.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: (_input, ctx) => {
    if (!ctx.isAuthenticated()) return unauthenticated();

    const identity = {
      userId: ctx.getUserId(),
      email: ctx.getUserEmail(),
    };

    return {
      content: [{ type: "text" as const, text: JSON.stringify(identity) }],
      structuredContent: identity,
    };
  },
});
