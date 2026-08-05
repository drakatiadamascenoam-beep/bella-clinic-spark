/**
 * Construção do contexto clínico imutável usado pelo prompt builder.
 *
 * Hierarquia fixa: Paciente -> Atendimento -> Profissional -> Protocolos -> Pergunta.
 * Função pura: recebe todos os dados já resolvidos, não acessa rede/DB.
 */

export interface ClinicalContextPatient {
  readonly id: string;
  readonly name: string;
  readonly age: number | null;
  readonly relevantHistory: readonly string[];
}

export interface ClinicalContextAttendance {
  readonly id: string | null;
  readonly complaint: string;
  readonly evolutionNotes: readonly string[];
}

export interface ClinicalContextProfessional {
  readonly id: string;
  readonly name: string;
  readonly specialty: string | null;
}

export interface ClinicalContextProtocol {
  readonly id: string;
  readonly name: string;
}

export interface BuildClinicalContextInput {
  readonly patient: ClinicalContextPatient;
  readonly attendance: ClinicalContextAttendance;
  readonly professional: ClinicalContextProfessional;
  readonly protocols: readonly ClinicalContextProtocol[];
  readonly question: string;
}

/** Contexto clínico estruturado, profundamente imutável, para uso no prompt builder. */
export type ClinicalContext = Readonly<{
  patient: Readonly<ClinicalContextPatient>;
  attendance: Readonly<ClinicalContextAttendance>;
  professional: Readonly<ClinicalContextProfessional>;
  protocols: readonly Readonly<ClinicalContextProtocol>[];
  question: string;
}>;

/** Constrói o contexto clínico imutável seguindo a hierarquia Paciente -> Atendimento -> Profissional -> Protocolos -> Pergunta. */
export function buildClinicalContext(input: BuildClinicalContextInput): ClinicalContext {
  return Object.freeze({
    patient: Object.freeze({ ...input.patient, relevantHistory: [...input.patient.relevantHistory] }),
    attendance: Object.freeze({
      ...input.attendance,
      evolutionNotes: [...input.attendance.evolutionNotes],
    }),
    professional: Object.freeze({ ...input.professional }),
    protocols: Object.freeze(input.protocols.map((protocol) => Object.freeze({ ...protocol }))),
    question: input.question,
  });
}
