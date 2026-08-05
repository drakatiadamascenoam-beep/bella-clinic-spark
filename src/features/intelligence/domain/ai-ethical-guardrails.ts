/**
 * Guardrails éticos da Bella Intelligence.
 *
 * Princípio de Soberania Clínica: nenhuma saída de IA pode ser exibida como
 * diagnóstico ou prescrição. Este módulo é puro — apenas transforma e valida
 * texto, sem I/O, sem aleatoriedade e sem relógio.
 */

export const CLINICAL_DISCLAIMER =
  "Sugestão gerada por apoio à decisão da Bella IA. Não substitui avaliação, diagnóstico ou prescrição de um profissional de saúde habilitado. Confirmação profissional obrigatória.";

const CLINICAL_KEYWORDS = [
  "diagnóstico",
  "diagnostico",
  "prescrev",
  "prescriç",
  "prescric",
  "receita",
  "dosagem",
  "medicamento",
  "protocolo",
  "tratamento",
  "contraindica",
];

const UNSAFE_PATTERNS = [
  /ignore\s+as?\s+instru[cç][oõ]es/gi,
  /system\s*prompt/gi,
  /<\|.*?\|>/g,
];

/** Indica se o conteúdo textual menciona termos de natureza clínica. */
export function containsClinicalRecommendation(text: string): boolean {
  const normalized = text.toLowerCase();
  return CLINICAL_KEYWORDS.some((keyword) => normalized.includes(keyword));
}

/** Determina se um disclaimer obrigatório deve ser exibido para o texto informado. */
export function mustDisplayDisclaimer(text: string): boolean {
  return containsClinicalRecommendation(text);
}

/** Determina se a saída exige confirmação humana explícita antes de qualquer ação. */
export function requiresHumanApproval(text: string): boolean {
  return containsClinicalRecommendation(text);
}

/** Toda recomendação clínica desta plataforma exige confirmação profissional — invariante fixa. */
export function mustRequireProfessionalConfirmation(): true {
  return true;
}

/** Remove tentativas de injeção de prompt e instruções de sistema do texto do usuário. */
export function sanitizePrompt(input: string): string {
  let sanitized = input;
  for (const pattern of UNSAFE_PATTERNS) {
    sanitized = sanitized.replace(pattern, "");
  }
  return sanitized.trim().slice(0, 4000);
}

/** Remove conteúdo potencialmente inseguro de uma resposta de provedor de IA. */
export function stripUnsafeContent(text: string): string {
  let stripped = text;
  for (const pattern of UNSAFE_PATTERNS) {
    stripped = stripped.replace(pattern, "");
  }
  return stripped.trim();
}

/** Garante que a resposta do provedor é uma string não vazia e utilizável. */
export function validateProviderResponse(text: string | null | undefined): text is string {
  return typeof text === "string" && text.trim().length > 0;
}

/** Anexa o disclaimer obrigatório à resposta final, evitando duplicidade. */
export function appendMandatoryDisclaimer(text: string): string {
  const cleaned = stripUnsafeContent(text);
  if (cleaned.includes(CLINICAL_DISCLAIMER)) return cleaned;
  return `${cleaned}\n\n${CLINICAL_DISCLAIMER}`;
}

/** Sanitiza e prepara a resposta final da Bella IA aplicando todos os guardrails. */
export function sanitizeResponse(text: string): string {
  return appendMandatoryDisclaimer(stripUnsafeContent(text));
}
