import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { validateClinicalText } from "../services/ai-orchestrator.service";
import type { AIExecutionResult, ClinicalValidationResult } from "../types/ai.types";

/** Hook de validação de texto de evolução clínica. */
export function useValidateClinicalText() {
  const validate = useServerFn(validateClinicalText);
  return useMutation<AIExecutionResult<ClinicalValidationResult>, Error, string>({
    mutationFn: (text) => validate({ data: { text } }),
  });
}
