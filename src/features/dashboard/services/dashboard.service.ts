import { getPacientes } from "@/features/patients/services/patient.service";
import { getAtendimentos } from "@/features/attendance/services/attendance.service";
import { getAgendamentos } from "@/features/schedule/services/schedule.service";
import { getProfissionais } from "@/features/professionals/services/professional.service";
import { listProtocols } from "@/services/protocol.service";

import {
  enumerateDays,
  formatRangeLabel,
  previousRange,
  resolvePeriodRange,
  type DashboardPeriod,
  type DateRange,
} from "../domain/dashboard-filters";
import {
  absenteeismRate,
  activePatients,
  activeProfessionals,
  averageAttendancesPerPatient,
  cancellationRate,
  completedAttendances,
  computeTrend,
  futureAppointments,
  newPatients,
  occupancyRate,
  totalAttendances,
} from "../domain/dashboard-kpis";
import {
  attendanceTrend,
  occupancyByHour,
  professionalPerformance,
  topProfessionals,
  topProtocols,
} from "../domain/dashboard-analytics";
import { buildBaseInsights } from "../domain/dashboard-insights";
import {
  professionalCapacity,
  toAppointmentPoint,
  toAttendancePoint,
  toChartPoints,
  toDistribution,
  toMetricCard,
  toPatientPoint,
  toPerformanceRows,
  toProfessionalPoint,
} from "../mappers/dashboard.mapper";
import type { DashboardAvailability, DashboardSnapshot } from "../types/dashboard.types";

/**
 * Orquestrador do Cockpit Executivo.
 *
 * Consome EXCLUSIVAMENTE as interfaces públicas das Sprints 2–8.
 * Nenhuma chamada direta ao Supabase acontece aqui: os serviços de cada
 * domínio já encapsulam a leitura autenticada no servidor.
 */

/** Teto de dias consultados na Agenda por execução (uma leitura por dia). */
const SCHEDULE_DAYS_LIMIT = 31;

export interface DashboardQuery {
  period: DashboardPeriod;
  custom?: DateRange | null;
  reference?: Date;
}

async function safe<T>(load: () => Promise<T>, fallback: T): Promise<{ data: T; ok: boolean }> {
  try {
    return { data: await load(), ok: true };
  } catch {
    return { data: fallback, ok: false };
  }
}

async function loadSchedule(range: DateRange) {
  const days = enumerateDays(range, SCHEDULE_DAYS_LIMIT);
  const results = await Promise.all(
    days.map((date) =>
      safe(() => getAgendamentos({ data: { date, status: "all" as const } }), null),
    ),
  );

  const items = results.flatMap((result) => result.data?.items ?? []);
  const available = results.some((result) => result.ok && result.data?.sourceUnavailable === false);
  return { items, available };
}

export async function loadDashboardSnapshot(query: DashboardQuery): Promise<DashboardSnapshot> {
  const reference = query.reference ?? new Date();
  const range = resolvePeriodRange(query.period, reference, query.custom ?? null);
  const comparison = previousRange(range);

  const [patients, attendances, professionals, protocols, schedule] = await Promise.all([
    safe(
      () =>
        getPacientes({
          data: { search: "", sortBy: "created_at" as const, sortDir: "desc" as const, page: 1 },
        }),
      null,
    ),
    safe(
      () => getAtendimentos({ data: { search: "", status: "all" as const, page: 1 } }),
      null,
    ),
    safe(() => getProfissionais({ data: { search: "", role: "all" as const } }), null),
    safe(
      () =>
        listProtocols({
          data: { search: "", status: "all" as const, category: "all" as const, page: 1 },
        }),
      null,
    ),
    loadSchedule(range),
  ]);

  const availability: DashboardAvailability = {
    patients: patients.ok && patients.data?.sourceUnavailable === false,
    attendances: attendances.ok && attendances.data?.sourceUnavailable === false,
    professionals: professionals.ok && professionals.data?.sourceUnavailable === false,
    protocols: protocols.ok && protocols.data?.sourceUnavailable === false,
    schedule: schedule.available,
  };

  const patientPoints = (patients.data?.items ?? []).map(toPatientPoint);
  const attendancePoints = (attendances.data?.items ?? []).map(toAttendancePoint);
  const professionalPoints = (professionals.data?.items ?? []).map(toProfessionalPoint);
  const appointmentPoints = schedule.items.map(toAppointmentPoint);

  const occupancy = occupancyRate(appointmentPoints, professionalPoints, range);
  const absences = absenteeismRate(appointmentPoints, range);
  const cancellations = cancellationRate(appointmentPoints, range);
  const attendancesNow = totalAttendances(attendancePoints, range);
  const attendancesBefore = totalAttendances(attendancePoints, comparison);
  const newPatientsNow = newPatients(patientPoints, range);
  const newPatientsBefore = newPatients(patientPoints, comparison);

  const cards = [
    toMetricCard({
      id: "occupancy",
      label: "Taxa de ocupação",
      value: occupancy,
      format: "percent",
      hint: "Agenda ocupada sobre a capacidade da equipe ativa",
      trend: computeTrend(occupancy, occupancyRate(appointmentPoints, professionalPoints, comparison)),
      available: availability.schedule && availability.professionals,
    }),
    toMetricCard({
      id: "absenteeism",
      label: "Absenteísmo",
      value: absences,
      format: "percent",
      hint: "Faltas sobre compromissos com desfecho",
      trend: computeTrend(absences, absenteeismRate(appointmentPoints, comparison), {
        inverted: true,
      }),
      available: availability.schedule,
    }),
    toMetricCard({
      id: "attendances",
      label: "Atendimentos realizados",
      value: completedAttendances(attendancePoints, range),
      format: "number",
      hint: "Sessões concluídas no período",
      trend: computeTrend(attendancesNow, attendancesBefore),
      available: availability.attendances,
    }),
    toMetricCard({
      id: "average-per-patient",
      label: "Média por paciente",
      value: averageAttendancesPerPatient(attendancePoints, range),
      format: "decimal",
      hint: "Sessões por paciente atendido",
      trend: computeTrend(
        averageAttendancesPerPatient(attendancePoints, range),
        averageAttendancesPerPatient(attendancePoints, comparison),
      ),
      available: availability.attendances,
    }),
    toMetricCard({
      id: "active-patients",
      label: "Pacientes ativos",
      value: activePatients(attendancePoints, range),
      format: "number",
      hint: "Pacientes com ao menos uma sessão",
      trend: computeTrend(
        activePatients(attendancePoints, range),
        activePatients(attendancePoints, comparison),
      ),
      available: availability.attendances,
    }),
    toMetricCard({
      id: "new-patients",
      label: "Pacientes novos",
      value: newPatientsNow,
      format: "number",
      hint: "Cadastros criados no período",
      trend: computeTrend(newPatientsNow, newPatientsBefore),
      available: availability.patients,
    }),
    toMetricCard({
      id: "future-appointments",
      label: "Agendamentos futuros",
      value: futureAppointments(appointmentPoints, reference),
      format: "number",
      hint: "Compromissos ainda por acontecer",
      trend: { direction: "neutral", value: null },
      available: availability.schedule,
    }),
    toMetricCard({
      id: "active-professionals",
      label: "Profissionais ativos",
      value: activeProfessionals(professionalPoints),
      format: "number",
      hint: "Equipe clínica habilitada",
      trend: { direction: "neutral", value: null },
      available: availability.professionals,
    }),
  ];

  return {
    metrics: {
      cards,
      period: {
        period: query.period,
        range,
        label: formatRangeLabel(range),
      },
      availability,
    },
    analytics: {
      attendanceTrend: toChartPoints(attendanceTrend(attendancePoints, range)),
      occupancyByHour: toChartPoints(occupancyByHour(appointmentPoints, range)),
      protocolDistribution: toDistribution(
        topProtocols(attendancePoints, appointmentPoints, range),
      ),
      professionalRanking: toDistribution(topProfessionals(appointmentPoints, range)),
      professionalPerformance: toPerformanceRows(
        professionalPerformance(appointmentPoints, professionalPoints, range, professionalCapacity),
      ),
      availability,
    },
    insights: buildBaseInsights({
      occupancyRate: occupancy,
      absenteeismRate: absences,
      cancellationRate: cancellations,
      attendancesTotal: attendancesNow,
      newPatients: newPatientsNow,
      activeProfessionals: activeProfessionals(professionalPoints),
    }),
  };
}
