/**
 * Motor clínico determinístico da Bella Intelligence.
 *
 * Regras puras de apoio à decisão: validação de evolução clínica e
 * recomendação de protocolos-mestre por palavras-chave/pontuação.
 * Nenhuma função aqui usa Math.random, Date.now, I/O ou rede — determinismo
 * garantido (mesma entrada, mesma saída).
 */

import { CLINICAL_DISCLAIMER } from "./ai-ethical-guardrails";
import type { ClinicalRecommendation, ClinicalValidationResult } from "../types/ai.types";

/** Protocolo-mestre disponível para recomendação por regras. */
export interface MasterProtocol {
  readonly id: string;
  readonly name: string;
  readonly keywords: readonly string[];
}

const MIN_EVOLUTION_LENGTH = 40;

const REQUIRED_SECTIONS: readonly { readonly label: string; readonly pattern: RegExp }[] = [
  { label: "queixa principal", pattern: /queixa/i },
  { label: "conduta adotada", pattern: /condut|encaminh|orienta/i },
  { label: "evolução observada", pattern: /evolu|melhora|piora|resposta/i },
];

/** Analisa um texto de evolução clínica e produz um resultado de validação determinístico. */
export function validateClinicalEvolution(text: string): ClinicalValidationResult {
  const trimmed = text.trim();
  const issues: string[] = [];
  const recommendations: string[] = [];

  if (trimmed.length < MIN_EVOLUTION_LENGTH) {
    issues.push("Evolução muito curta para registrar contexto clínico suficiente.");
    recommendations.push("Descreva queixa, conduta e resposta observada com mais detalhe.");
  }

  for (const section of REQUIRED_SECTIONS) {
    if (!section.pattern.test(trimmed)) {
      issues.push(`Não foi identificada menção a "${section.label}".`);
      recommendations.push(`Inclua explicitamente a ${section.label} no texto.`);
    }
  }

  const sectionsFound = REQUIRED_SECTIONS.length - issues.filter((i) => i.includes("menção")).length;
  const lengthScore = Math.min(trimmed.length / 300, 1);
  const sectionScore = sectionsFound / REQUIRED_SECTIONS.length;
  const score = Math.round((lengthScore * 0.4 + sectionScore * 0.6) * 100);
  const confidence = Math.round((1 - issues.length / (REQUIRED_SECTIONS.length + 1)) * 100) / 100;

  if (issues.length === 0) {
    recommendations.push("Evolução completa. Revisão profissional ainda é obrigatória antes de finalizar.");
  }

  return {
    score,
    issues,
    recommendations,
    confidence: Math.max(confidence, 0),
    validationSource: "LOCAL_RULES",
    requiresProfessionalConfirmation: true,
    disclaimer: CLINICAL_DISCLAIMER,
  };
}

interface ProtocolScoreInput {
  readonly history: readonly string[];
  readonly complaint: string;
  readonly protocols: readonly MasterProtocol[];
}

function scoreProtocol(protocol: MasterProtocol, corpus: string): number {
  const normalizedCorpus = corpus.toLowerCase();
  const matches = protocol.keywords.filter((keyword) =>
    normalizedCorpus.includes(keyword.toLowerCase()),
  ).length;
  if (matches === 0) return 0;
  return Math.round((matches / protocol.keywords.length) * 100);
}

/** Recomenda protocolos-mestre a partir do histórico do paciente e da queixa atual. */
export function recommendMasterProtocols(
  input: ProtocolScoreInput,
): readonly ClinicalRecommendation[] {
  const corpus = [...input.history, input.complaint].join(" \n ");

  return input.protocols
    .map((protocol) => {
      const score = scoreProtocol(protocol, corpus);
      return { protocol, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ protocol, score }) => ({
      id: `rec-${protocol.id}`,
      protocolId: protocol.id,
      protocolName: protocol.name,
      rationale: `Correspondência de palavras-chave (${score}%) entre histórico/queixa e o protocolo "${protocol.name}".`,
      score,
      confidence: Math.min(score / 100, 1),
      disclaimer: CLINICAL_DISCLAIMER,
      requiresProfessionalConfirmation: true as const,
    }));
}
