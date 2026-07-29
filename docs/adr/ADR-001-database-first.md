# ADR-001 — Database First: Supabase como Single Source of Truth

- Status: Aceito
- Data: 2026-07-29

## Contexto

A Bella Clinic Platform (Bella IA) opera sobre o **Bella Knowledge Graph v3.0 (BKG v3.0)**, um modelo de dados clínico já completamente modelado na instância gerenciada (Lovable Cloud / Supabase). O frontend é consumidor desse modelo, não seu proprietário. Historicamente, aplicações que criam estruturas paralelas no cliente (mocks, listas fixas, tabelas auxiliares) acabam divergindo do domínio real e produzindo informação clínica incorreta.

## Decisão

1. O banco de dados é a **única fonte da verdade** do domínio.
2. O schema do BKG v3.0 está **congelado**: o frontend não cria, altera ou remove tabelas, colunas, enums, políticas ou funções.
3. Nenhum dado mockado ou hardcoded é permitido em telas, hooks ou serviços. Na ausência de dados, a UI exibe *empty state* ou estado "indisponível".
4. Tipos TypeScript derivam exclusivamente de `src/integrations/supabase/types.ts` (gerado). Type assertions temporárias são toleradas apenas enquanto o schema não estiver publicado, e devem ser removidas assim que os tipos gerados existirem.
5. Todo acesso a dados passa pela camada de serviços (`src/services` e, por domínio, `src/features/<dominio>/services`). Componentes não chamam o cliente Supabase diretamente.

## Justificativa

- Elimina divergência entre modelo real e modelo presumido pela interface.
- Garante que RLS e regras de negócio no banco sejam sempre respeitadas.
- Torna a evolução do schema previsível: mudanças nascem no modelo, propagam-se via tipos gerados e quebram o build quando incompatíveis.
- Evita que dados fictícios cheguem a um contexto clínico.

## Consequências

**Positivas**
- Consistência de domínio garantida por construção.
- Erros de contrato aparecem em tempo de compilação.
- Camada de serviços testável e substituível sem tocar na UI.

**Negativas / custos**
- Enquanto o schema não está publicado, telas mostram estados vazios em vez de conteúdo ilustrativo.
- Alterações de modelo exigem migração no banco antes de qualquer trabalho de interface.
- Necessidade de disciplina para regenerar tipos após cada migração.
