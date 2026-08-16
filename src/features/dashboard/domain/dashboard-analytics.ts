/**
 * Domínio puro — Rankings, distribuições e séries temporais do Cockpit.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 */

import {
  enumerateDays,
  isoToDateKey,
  isWithinRange,
  type DateRange,
} from "./dashboard-filters";
import type { AppointmentPoint, AttendancePoint, ProfessionalPoint } from "./dashboard-kpis";

export interface RankingEntry {
  key: string;
  label: string;
  value: number;
  /** Participação percentual sobre o total do ranking. */
  share: number;
}

export interface SeriesPoint {
  key: string;
  label: string;
  value: number;
}

export interface ProfessionalPerformance {
  professionalId: string;
  name: string;
  appointments: number;
  attended: number;
  absences: number;
  cancellations: number;
  /** Minutos médios por compromisso não cancelado. */
  averageMinutes: number | null;
  occupancy: number | null;
}

function rank(counts: Map<string, { label: string; value: number }>, limit: number): RankingEntry[] {
  const entries = [...counts.entries()];
  const total = entries.reduce((sum, [, item]) => sum + item.value, 0);
  return entries
    .map(([key, item]) => ({
      key,
      label: item.label,
      value: item.value,
      share: total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.value - a.value || a.label.localeCompare(b.label))
    .slice(0, limit);
}

/** Protocolos Mestres mais aplicados, combinando agenda e atendimentos. */
export function topProtocols(
  attendances: AttendancePoint[],
  appointments: AppointmentPoint[],
  range: DateRange,
  limit = 6,
): RankingEntry[] {
  const counts = new Map<string, { label: string; value: number }>();

  const bump = (name: string | null) => {
    if (!name) return;
    const key = name.trim().toLowerCase();
    if (!key) return;
    const current = counts.get(key);
    counts.set(key, { label: name.trim(), value: (current?.value ?? 0) + 1 });
  };

  attendances
    .filter((attendance) => isWithinRange(attendance.date, range))
    .forEach((attendance) => bump(attendance.protocolName));

  if (counts.size === 0) {
    appointments
      .filter((appointment) => isWithinRange(appointment.startsAt, range))
      .forEach((appointment) => bump(appointment.protocolName));
  }

  return rank(counts, limit);
}

/** Ranking de profissionais por volume de compromissos atendidos. */
export function topProfessionals(
  appointments: AppointmentPoint[],
  range: DateRange,
  limit = 6,
): RankingEntry[] {
  const counts = new Map<string, { label: string; value: number }>();

  appointments
    .filter((appointment) => isWithinRange(appointment.startsAt, range))
    .filter((appointment) => appointment.status !== "CANCELADO")
    .forEach((appointment) => {
      const key = appointment.professionalId ?? appointment.professionalName;
      if (!key) return;
      const label = appointment.professionalName ?? "Profissional";
      const current = counts.get(key);
      counts.set(key, { label, value: (current?.value ?? 0) + 1 });
    });

  return rank(counts, limit);
}

/** Série diária de atendimentos realizados. */
export function attendanceTrend(
  attendances: AttendancePoint[],
  range: DateRange,
): SeriesPoint[] {
  const days = enumerateDays(range);
  const counts = new Map<string, number>(days.map((day) => [day, 0]));

  attendances.forEach((attendance) => {
    const key = isoToDateKey(attendance.date);
    if (key && counts.has(key)) counts.set(key, (counts.get(key) ?? 0) + 1);
  });

  return days.map((day) => ({
    key: day,
    label: `${day.slice(8, 10)}/${day.slice(5, 7)}`,
    value: counts.get(day) ?? 0,
  }));
}

/** Distribuição da agenda por hora do dia (horários de pico). */
export function occupancyByHour(
  appointments: AppointmentPoint[],
  range: DateRange,
): SeriesPoint[] {
  const buckets = new Map<number, number>();

  appointments
    .filter((appointment) => isWithinRange(appointment.startsAt, range))
    .filter((appointment) => appointment.status !== "CANCELADO")
    .forEach((appointment) => {
      if (!appointment.startsAt) return;
      const at = new Date(appointment.startsAt);
      if (Number.isNaN(at.getTime())) return;
      const hour = at.getHours();
      buckets.set(hour, (buckets.get(hour) ?? 0) + 1);
    });

  if (buckets.size === 0) return [];

  const hours = [...buckets.keys()].sort((a, b) => a - b);
  const first = Math.min(...hours);
  const last = Math.max(...hours);

  const series: SeriesPoint[] = [];
  for (let hour = first; hour <= last; hour += 1) {
    series.push({
      key: `${hour}`,
      label: `${`${hour}`.padStart(2, "0")}h`,
      value: buckets.get(hour) ?? 0,
    });
  }
  return series;
}

/** Distribuição de compromissos por status da agenda. */
export function appointmentStatusDistribution(
  appointments: AppointmentPoint[],
  range: DateRange,
): RankingEntry[] {
  const counts = new Map<string, { label: string; value: number }>();
  appointments
    .filter((appointment) => isWithinRange(appointment.startsAt, range))
    .forEach((appointment) => {
      const current = counts.get(appointment.status);
      counts.set(appointment.status, {
        label: appointment.status,
        value: (current?.value ?? 0) + 1,
      });
    });
  return rank(counts, 10);
}

/** Tabela de desempenho por profissional. */
export function professionalPerformance(
  appointments: AppointmentPoint[],
  professionals: ProfessionalPoint[],
  range: DateRange,
  capacityPerProfessional: (professional: ProfessionalPoint) => number,
): ProfessionalPerformance[] {
  const byId = new Map<string, ProfessionalPerformance>();

  professionals
    .filter((professional) => professional.active)
    .forEach((professional) => {
      byId.set(professional.id, {
        professionalId: professional.id,
        name: professional.name,
        appointments: 0,
        attended: 0,
        absences: 0,
        cancellations: 0,
        averageMinutes: null,
        occupancy: null,
      });
    });

  const minutes = new Map<string, { total: number; count: number }>();

  appointments
    .filter((appointment) => isWithinRange(appointment.startsAt, range))
    .forEach((appointment) => {
      const id = appointment.professionalId;
      if (!id) return;
      const row =
        byId.get(id) ??
        ({
          professionalId: id,
          name: appointment.professionalName ?? "Profissional",
          appointments: 0,
          attended: 0,
          absences: 0,
          cancellations: 0,
          averageMinutes: null,
          occupancy: null,
        } satisfies ProfessionalPerformance);

      row.appointments += 1;
      if (appointment.status === "CONCLUIDO") row.attended += 1;
      if (appointment.status === "FALTA") row.absences += 1;
      if (appointment.status === "CANCELADO") row.cancellations += 1;

      if (appointment.status !== "CANCELADO") {
        const acc = minutes.get(id) ?? { total: 0, count: 0 };
        minutes.set(id, {
          total: acc.total + Math.max(0, appointment.durationMinutes),
          count: acc.count + 1,
        });
      }

      byId.set(id, row);
    });

  return [...byId.values()]
    .map((row) => {
      const acc = minutes.get(row.professionalId);
      const professional = professionals.find((item) => item.id === row.professionalId);
      const capacity = professional ? capacityPerProfessional(professional) : 0;
      return {
        ...row,
        averageMinutes: acc && acc.count > 0 ? Math.round(acc.total / acc.count) : null,
        occupancy:
          capacity > 0 && acc
            ? Math.min(100, Math.round((acc.total / capacity) * 1000) / 10)
            : null,
      };
    })
    .sort((a, b) => b.appointments - a.appointments || a.name.localeCompare(b.name));
}
