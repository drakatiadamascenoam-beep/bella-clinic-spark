# ADR-002 — Autenticação corporativa e remoção do cadastro público

- Status: Aceito
- Data: 2026-07-29

## Contexto

A Bella IA é uma aplicação **corporativa interna** da clínica Esthetic Center. Seus usuários são profissionais e equipe administrativa, com acesso a dados clínicos sensíveis. Um fluxo de auto-cadastro público permitiria que qualquer pessoa criasse uma conta e alcançasse a superfície autenticada da aplicação.

## Decisão

1. A tela `/auth` oferece **apenas o fluxo "Entrar"**. Não existe formulário público de criação de conta.
2. Credenciais são **provisionadas pela administração**. O rodapé da tela orienta: *"Primeiro acesso? Solicite credenciais à administração."*
3. Está disponível a recuperação de senha ("Esqueci minha senha"), com definição de nova senha em `/reset-password` via link enviado por e-mail.
4. Todas as rotas de trabalho vivem sob o layout `src/routes/_authenticated/`, que redireciona usuários sem sessão para `/auth`.
5. A sessão é exposta à aplicação por `AuthProvider` + hook `useAuth`; server functions protegidas recebem o bearer token via middleware do cliente.
6. Autorização por papel (RBAC), quando implementada, usará tabela dedicada de papéis no banco — nunca campos de papel no perfil e nunca verificação em armazenamento do cliente.

## Justificativa

- Reduz a superfície de ataque a zero para atores externos não provisionados.
- Alinha o ciclo de vida da conta ao ciclo de vida do vínculo profissional.
- Centraliza a decisão de acesso no servidor e nas políticas do banco, não na interface.
- Mantém rastreabilidade: cada conta tem origem administrativa conhecida.

## Consequências

**Positivas**
- Acesso controlado e auditável.
- Interface de login simples, com um único caminho feliz.

**Negativas / custos**
- Onboarding depende de ação humana da administração.
- É necessária uma área administrativa futura para criação e desativação de usuários.
- Fluxos de convite/expiração precisam ser desenhados quando o volume de usuários crescer.
