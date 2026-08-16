/**
 * Domínio puro — Cálculo de KPIs clínico-operacionais.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 * Todas as funções são determinísticas e operam sobre os pontos de
 * agregação abaixo, produzidos pelos mappers do Dashboard.
 */

import { countDays, isWithinRange, type DateRange } from "./dashboard-filters";

/** Agendamento reduzido ao mínimo necessário para estatística. */
export interface AppointmentPoint {
  id: string;
  status: string;
  startsAt: string | null;
  durationMinutes: number;
  professionalId: string | null;
  professionalName: string | null;
  protocolName: string | null;
  patientId: string | null;
}

/** Atendimento clínico reduzido ao mínimo necessário para estatística. */
export interface AttendancePoint {
  id: string;
  status: string;
  date: string | null;
  patientId: string | null;
  protocolName: string | null;
}

export interface PatientPoint {
  id: string;
  createdAt: string | null;
}

export interface ProfessionalPoint {
  id: string;
  name: string;
  active: boolean;
  weekdays: string[];
  startTime: string;
  endTime: string;
  breakStart: string | null;
  breakEnd: string | null;
}

export const ATTENDED_APPOINTMENT_STATUSES = ["CONCLUIDO", "EM_ATENDIMENTO"] as const;
export const ABSENT_APPOINTMENT_STATUSES = ["FALTA"] as const;
export const CANCELED_APPOINTMENT_STATUSES = ["CANCELADO"] as const;

function minutesFromTime(time: string | null): number | null {
  if (!time) return null;
  const match = /^(\d{1,2}):(\d{2})/.exec(time.trim());
  if (!match) return null;
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) return null;
  return hours * 60 + minutes;
}

/** Minutos úteis diários de um profissional, descontando o intervalo. */
export function dailyCapacityMinutes(professional: ProfessionalPoint): number {
  const start = minutesFromTime(professional.startTime);
  const end = minutesFromTime(professional.endTime);
  if (start === null || end === null || end <= start) return 0;

  const breakStart = minutesFromTime(professional.breakStart);
  const breakEnd = minutesFromTime(professional.breakEnd);
  const pause = breakStart !== null && breakEnd !== null && breakEnd > breakStart ? breakEnd - breakStart : 0;

  return Math.max(0, end - start - pause);
}

/** Capacidade total (minutos) da equipe ativa dentro do intervalo. */
export function totalCapacityMinutes(
  professionals: ProfessionalPoint[],
  range: DateRange,
): number {
  const days = countDays(range);
  if (days === 0) return 0;

  return professionals
    .filter((professional) => professional.active)
    .reduce((total, professional) => {
      const workedDays = professional.weekdays.length > 0 ? professional.weekdays.length : 5;
      const weeks = days / 7;
      const effectiveDays = Math.max(1, Math.round(weeks * workedDays) || 1);
      return total + dailyCapacityMinutes(professional) * effectiveDays;
    }, 0);
}

export function bookedMinutes(appointments: AppointmentPoint[], range: DateRange): number {
  return appointments
    .filter((appointment) => isWithinRange(appointment.startsAt, range))
    .filter((appointment) => !CANCELED_APPOINTMENT_STATUSES.includes(appointment.status as "CANCELADO"))
    .reduce((total, appointment) => total + Math.max(0, appointment.durationMinutes), 0);
}

function ratio(numerator: number, denominator: number): number | null {
  if (denominator <= 0) return null;
  return Math.round((numerator / denominator) * 1000) / 10;
}

/** Taxa de ocupação da agenda (%), null quando não há capacidade conhecida. */
export function occupancyRate(
  appointments: AppointmentPoint[],
  professionals: ProfessionalPoint[],
  range: DateRange,
): number | null {
  const capacity = totalCapacityMinutes(professionals, range);
  if (capacity <= 0) return null;
  const booked = bookedMinutes(appointments, range);
  return Math.min(100, ratio(booked, capacity) ?? 0);
}

/** Taxa de absenteísmo (%) sobre compromissos com desfecho conhecido. */
export function absenteeismRate(
  appointments: AppointmentPoint[],
  range: DateRange,
): number | null {
  const inRange = appointments.filter((appointment) => isWithinRange(appointment.startsAt, range));
  const settled = inRange.filter((appointment) =>
    ["CONCLUIDO", "FALTA", "CANCELADO"].includes(appointment.status),
  );
  if (settled.length === 0) return null;
  const absences = settled.filter((appointment) => appointment.status === "FALTA").length;
  return ratio(absences, settled.length);
}

export function cancellationRate(
  appointments: AppointmentPoint[],
  range: DateRange,
): number | null {
  const inRange = appointments.filter((appointment) => isWithinRange(appointment.startsAt, range));
  if (inRange.length === 0) return null;
  const canceled = inRange.filter((appointment) => appointment.status === "CANCELADO").length;
  return ratio(canceled, inRange.length);
}

export function completedAttendances(
  attendances: AttendancePoint[],
  range: DateRange,
): number {
  return attendances.filter(
    (attendance) => attendance.status === "CONCLUIDO" && isWithinRange(attendance.date, range),
  ).length;
}

export function totalAttendances(attendances: AttendancePoint[], range: DateRange): number {
  return attendances.filter((attendance) => isWithinRange(attendance.date, range)).length;
}

/** Média de atendimentos por paciente atendido no intervalo. */
export function averageAttendancesPerPatient(
  attendances: AttendancePoint[],
  range: DateRange,
): number | null {
  const inRange = attendances.filter((attendance) => isWithinRange(attendance.date, range));
  const patients = new Set(
    inRange.map((attendance) => attendance.patientId).filter((id): id is string => Boolean(id)),
  );
  if (patients.size === 0) return null;
  return Math.round((inRange.length / patients.size) * 10) / 10;
}

/** Pacientes com pelo menos um atendimento no intervalo. */
export function activePatients(attendances: AttendancePoint[], range: DateRange): number {
  return new Set(
    attendances
      .filter((attendance) => isWithinRange(attendance.date, range))
      .map((attendance) => attendance.patientId)
      .filter((id): id is string => Boolean(id)),
  ).size;
}

export function newPatients(patients: PatientPoint[], range: DateRange): number {
  return patients.filter((patient) => isWithinRange(patient.createdAt, range)).length;
}

/** Compromissos futuros em relação a uma referência temporal. */
export function futureAppointments(
  appointments: AppointmentPoint[],
  reference: Date,
): number {
  return appointments.filter((appointment) => {
    if (!appointment.startsAt) return false;
    if (["CANCELADO", "FALTA", "CONCLUIDO"].includes(appointment.status)) return false;
    const at = new Date(appointment.startsAt);
    return !Number.isNaN(at.getTime()) && at.getTime() >= reference.getTime();
  }).length;
}

export function activeProfessionals(professionals: ProfessionalPoint[]): number {
  return professionals.filter((professional) => professional.active).length;
}

export type TrendDirection = "up" | "down" | "neutral";

export interface TrendResult {
  direction: TrendDirection;
  /** Variação percentual em relação ao período anterior; null quando incomparável. */
  value: number | null;
}

/** Comparativo percentual entre o valor atual e o período anterior. */
export function computeTrend(
  current: number | null,
  previous: number | null,
  options?: { inverted?: boolean },
): TrendResult {
  if (current === null || previous === null || previous === 0) {
    return { direction: "neutral", value: null };
  }
  const delta = Math.round(((current - previous) / Math.abs(previous)) * 1000) / 10;
  if (delta === 0) return { direction: "neutral", value: 0 };
  const positive = options?.inverted ? delta < 0 : delta > 0;
  return { direction: positive ? "up" : "down", value: delta };
}
