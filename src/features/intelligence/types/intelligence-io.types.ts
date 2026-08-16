/**
 * Contratos de entrada da Bella Intelligence reexportados como tipos.
 *
 * Existe para que a camada de UI consuma apenas tipos (nunca funções) das
 * camadas internas de domínio, preservando a regra UI → Hooks → Services.
 */
export type { MetricPoint } from "../domain/ai-dashboard-engine";
export type { MasterProtocol } from "../domain/ai-clinical-engine";
export type {
  BuildClinicalContextInput,
  ClinicalContextAttendance,
  ClinicalContextPatient,
  ClinicalContextProfessional,
  ClinicalContextProtocol,
} from "../domain/clinical-context";
