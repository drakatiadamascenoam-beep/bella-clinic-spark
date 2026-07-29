# Domínio: Patients (Pacientes)

Responsável pelo cadastro e pela ficha do paciente: dados pessoais, contato,
histórico consolidado e informações clínicas de referência.

## Escopo
- Listagem, busca, detalhe e edição de pacientes.
- Consolidação do histórico do paciente a partir de outros domínios (somente leitura).
- Serviços de acesso às tabelas de pacientes do BKG v3.0.

## Fora do escopo
- Execução e registro de atendimentos (domínio `attendance`).
- Marcação de horários (domínio `agenda`).

## Estrutura
- `components/` — UI específica do domínio
- `hooks/` — estado e orquestração
- `services/` — acesso a dados
- `pages/` — composições de tela usadas pelas rotas
- `types/` — tipos derivados do schema e view models

Regras: sem dados mockados; tipos derivados do schema gerado; não importar pastas internas de outros domínios.
