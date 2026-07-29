# Architecture Decision Records — Bella Clinic Platform

Registro das decisões arquiteturais do projeto. Cada ADR segue as seções
**Contexto**, **Decisão**, **Justificativa** e **Consequências**.

| ADR | Título | Status |
| --- | --- | --- |
| [ADR-001](./ADR-001-database-first.md) | Database First: Supabase como Single Source of Truth | Aceito |
| [ADR-002](./ADR-002-authentication.md) | Autenticação corporativa e remoção do cadastro público | Aceito |
| [ADR-003](./ADR-003-dashboard.md) | Métricas unificadas via Custom Hooks e desacoplamento da UI | Aceito |
| [ADR-004](./ADR-004-feature-based-architecture.md) | Arquitetura orientada a domínios (`/src/features`) | Aceito |

Novas decisões relevantes devem gerar um novo ADR numerado sequencialmente.
ADRs existentes não são reescritos: quando superados, mudam de status e
referenciam o ADR que os substitui.
