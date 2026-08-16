import type { Appointment } from "@/features/schedule/types/schedule.types";
import type { Attendance } from "@/features/attendance";
import type { Patient } from "@/features/patients/types/patient.types";
import type { Professional } from "@/features/professionals";

import {
  dailyCapacityMinutes,
  type AppointmentPoint,
  type AttendancePoint,
  type PatientPoint,
  type ProfessionalPoint,
  type TrendResult,
} from "../domain/dashboard-kpis";
import type {
  ProfessionalPerformance,
  RankingEntry,
  SeriesPoint,
} from "../domain/dashboard-analytics";
import type {
  ChartPointModel,
  DistributionSliceModel,
  MetricCardModel,
  MetricFormat,
  ProfessionalPerformanceRow,
} from "../types/dashboard.types";

/**
 * Adaptação entre os contratos públicos das Sprints 2–8 e os pontos de
 * agregação do domínio do Dashboard, e entre agregações e view models.
 * Nenhum acesso a banco, React ou UI.
 */

export function toAppointmentPoint(appointment: Appointment): AppointmentPoint {
  return {
    id: appointment.id,
    status: appointment.status,
    startsAt: appointment.dataHoraInicio,
    durationMinutes: appointment.duracaoMinutos,
    professionalId: appointment.profissionalId,
    professionalName: appointment.profissionalNome,
    protocolName: appointment.protocoloNome,
    patientId: appointment.pacienteId,
  };
}

export function toAttendancePoint(attendance: Attendance): AttendancePoint {
  return {
    id: attendance.id,
    status: attendance.status,
    date: attendance.dataAtendimento ?? attendance.createdAt,
    patientId: attendance.pacienteId,
    protocolName: attendance.protocoloNome,
  };
}

export function toPatientPoint(patient: Patient): PatientPoint {
  return { id: patient.id, createdAt: patient.createdAt };
}

export function toProfessionalPoint(professional: Professional): ProfessionalPoint {
  return {
    id: professional.id,
    name: professional.nome,
    active: professional.ativo,
    weekdays: professional.diasAtendimento,
    startTime: professional.horarioInicio,
    endTime: professional.horarioFim,
    breakStart: professional.intervaloInicio,
    breakEnd: professional.intervaloFim,
  };
}

export const professionalCapacity = dailyCapacityMinutes;

function formatTrend(trend: TrendResult): string | null {
  if (trend.value === null) return null;
  const signal = trend.value > 0 ? "+" : "";
  return `${signal}${trend.value}% vs. período anterior`;
}

export interface MetricCardInput {
  id: string;
  label: string;
  value: number | null;
  format: MetricFormat;
  hint: string;
  trend: TrendResult;
  available: boolean;
}

export function toMetricCard(input: MetricCardInput): MetricCardModel {
  return {
    id: input.id,
    label: input.label,
    value: input.available ? input.value : null,
    format: input.format,
    hint: input.hint,
    trend: input.available ? formatTrend(input.trend) : null,
    trendValue: input.available ? input.trend.value : null,
    trendDirection: input.available ? input.trend.direction : "neutral",
    available: input.available,
  };
}

export function toChartPoints(series: SeriesPoint[]): ChartPointModel[] {
  return series.map((point) => ({ key: point.key, label: point.label, value: point.value }));
}

export function toDistribution(entries: RankingEntry[]): DistributionSliceModel[] {
  return entries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    value: entry.value,
    share: entry.share,
  }));
}

export function toPerformanceRows(
  rows: ProfessionalPerformance[],
): ProfessionalPerformanceRow[] {
  return rows.map((row) => ({
    id: row.professionalId,
    name: row.name,
    appointments: row.appointments,
    attended: row.attended,
    absences: row.absences,
    cancellations: row.cancellations,
    averageMinutes: row.averageMinutes,
    occupancy: row.occupancy,
  }));
}
