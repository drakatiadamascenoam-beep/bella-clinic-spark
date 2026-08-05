/**
 * Construtor versionado de prompts clínicos.
 *
 * Ordem estrita e imutável: System Prompt -> Contexto Clínico -> Prompt do
 * Usuário -> Restrições de Saída. Função pura, sem I/O.
 */

import type { ClinicalContext } from "./clinical-context";
import { CLINICAL_DISCLAIMER, sanitizePrompt } from "./ai-ethical-guardrails";

/** Versão semântica do formato de prompt clínico. */
export const PROMPT_VERSION = "1.0.0";

/** Estrutura do prompt final, com as quatro seções obrigatórias na ordem correta. */
export interface BuiltPrompt {
  readonly promptVersion: string;
  readonly systemPrompt: string;
  readonly clinicalContextBlock: string;
  readonly userPrompt: string;
  readonly outputConstraints: string;
  readonly fullPrompt: string;
}

const SYSTEM_PROMPT = `Você é a Bella IA, um sistema de apoio à decisão clínica (CDSS) da Bella Clinic Platform.
Você NUNCA fornece diagnóstico, prescrição ou dosagem. Você apenas apoia o raciocínio de um profissional
de saúde habilitado, que permanece integralmente responsável pela decisão final.`;

const OUTPUT_CONSTRAINTS = `Restrições de saída obrigatórias:
- Responda em português (pt-BR), de forma objetiva e estruturada.
- Nunca afirme um diagnóstico definitivo nem prescreva medicações ou dosagens.
- Sempre trate a saída como sugestão sujeita à confirmação profissional.
- Inclua o seguinte aviso ao final da resposta: "${CLINICAL_DISCLAIMER}"`;

function formatClinicalContextBlock(context: ClinicalContext): string {
  const historyList = context.patient.relevantHistory.length
    ? context.patient.relevantHistory.join("; ")
    : "sem histórico relevante registrado";
  const evolutionList = context.attendance.evolutionNotes.length
    ? context.attendance.evolutionNotes.join(" | ")
    : "sem notas de evolução";
  const protocolList = context.protocols.length
    ? context.protocols.map((protocol) => protocol.name).join(", ")
    : "nenhum protocolo associado";

  return [
    `Paciente: ${context.patient.name} (idade: ${context.patient.age ?? "não informada"}). Histórico relevante: ${historyList}.`,
    `Atendimento: queixa "${context.attendance.complaint}". Notas de evolução: ${evolutionList}.`,
    `Profissional responsável: ${context.professional.name} (${context.professional.specialty ?? "especialidade não informada"}).`,
    `Protocolos-mestre disponíveis: ${protocolList}.`,
  ].join("\n");
}

/** Constrói o prompt clínico completo e versionado, na ordem obrigatória. */
export function buildClinicalPrompt(context: ClinicalContext): BuiltPrompt {
  const clinicalContextBlock = formatClinicalContextBlock(context);
  const userPrompt = sanitizePrompt(context.question);

  const fullPrompt = [
    `# System Prompt\n${SYSTEM_PROMPT}`,
    `# Contexto Clínico\n${clinicalContextBlock}`,
    `# Pergunta do Usuário\n${userPrompt}`,
    `# Restrições de Saída\n${OUTPUT_CONSTRAINTS}`,
  ].join("\n\n");

  return {
    promptVersion: PROMPT_VERSION,
    systemPrompt: SYSTEM_PROMPT,
    clinicalContextBlock,
    userPrompt,
    outputConstraints: OUTPUT_CONSTRAINTS,
    fullPrompt,
  };
}
