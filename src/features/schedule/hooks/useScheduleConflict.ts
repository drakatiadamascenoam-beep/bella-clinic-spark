import { useMemo } from "react";
import {
  checkScheduleConflict,
  type ScheduleConflictCheck,
} from "../domain/schedule-conflict";
import { toScheduleSlot } from "../mappers/schedule.mapper";
import type { Appointment } from "../types/schedule.types";

/**
 * Ponte entre o domínio puro de conflitos e a UI.
 * Componentes React consomem este hook — nunca o /domain diretamente.
 */
export function useScheduleConflict(
  candidate: { startsAt: string; durationMinutes: number; ignoreId?: string | null },
  appointments: readonly Appointment[],
): ScheduleConflictCheck {
  return useMemo(
    () =>
      checkScheduleConflict(candidate, appointments.map(toScheduleSlot)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [candidate.startsAt, candidate.durationMinutes, candidate.ignoreId, appointments],
  );
}

export type { ScheduleConflictCheck };
