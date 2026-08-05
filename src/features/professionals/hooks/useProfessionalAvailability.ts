import { useMemo } from "react";
import {
  availabilityReason,
  canReceiveAppointments,
  isAvailableAt,
} from "../domain/professional-availability";
import type { Professional } from "../types/professional.types";

/**
 * Ponte entre o domínio puro de disponibilidade e a UI.
 * Componentes React consomem apenas este hook — nunca `/domain` diretamente.
 */
export function useProfessionalAvailability(
  professional: Professional | null,
  referenceIso: string,
) {
  return useMemo(() => {
    if (!professional) {
      return { available: false, reason: "Profissional não selecionado.", hasCoverage: false };
    }

    const schedule = {
      ativo: professional.ativo,
      diasAtendimento: professional.diasAtendimento,
      horarioInicio: professional.horarioInicio,
      horarioFim: professional.horarioFim,
      intervaloInicio: professional.intervaloInicio,
      intervaloFim: professional.intervaloFim,
    };

    return {
      available: isAvailableAt(schedule, referenceIso),
      reason: availabilityReason(schedule, referenceIso),
      hasCoverage: canReceiveAppointments(professional),
    };
  }, [professional, referenceIso]);
}
