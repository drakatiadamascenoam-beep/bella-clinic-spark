/**
 * Domínio puro — Conselhos profissionais e papéis clínicos/administrativos.
 *
 * Sem Supabase, sem React, sem TanStack Query, sem UI.
 * Apenas tipos e funções determinísticas.
 */

export const CONSELHO_PROFISSIONAL = {
  CRM: "CRM",
  COREN: "COREN",
  CRO: "CRO",
  CRBM: "CRBM",
  CREFITO: "CREFITO",
  CREF: "CREF",
  CRN: "CRN",
  CRP: "CRP",
  CRF: "CRF",
  CRFa: "CRFa",
  CRMV: "CRMV",
  CRTR: "CRTR",
  CFBio: "CFBio",
  OUTRO: "OUTRO",
} as const;

export type ConselhoProfissional =
  (typeof CONSELHO_PROFISSIONAL)[keyof typeof CONSELHO_PROFISSIONAL];

export const CONSELHO_PROFISSIONAL_VALUES = Object.values(
  CONSELHO_PROFISSIONAL,
) as ConselhoProfissional[];

export const CONSELHO_PROFISSIONAL_LABELS: Record<ConselhoProfissional, string> = {
  CRM: "CRM — Conselho Regional de Medicina",
  COREN: "COREN — Conselho Regional de Enfermagem",
  CRO: "CRO — Conselho Regional de Odontologia",
  CRBM: "CRBM — Conselho Regional de Biomedicina",
  CREFITO: "CREFITO — Conselho Regional de Fisioterapia e Terapia Ocupacional",
  CREF: "CREF — Conselho Regional de Educação Física",
  CRN: "CRN — Conselho Regional de Nutrição",
  CRP: "CRP — Conselho Regional de Psicologia",
  CRF: "CRF — Conselho Regional de Farmácia",
  CRFa: "CRFa — Conselho Regional de Fonoaudiologia",
  CRMV: "CRMV — Conselho Regional de Medicina Veterinária",
  CRTR: "CRTR — Conselho Regional de Técnicos em Radiologia",
  CFBio: "CFBio — Conselho Federal de Biologia",
  OUTRO: "Outro",
};

export function isConselhoProfissional(value: unknown): value is ConselhoProfissional {
  return (
    typeof value === "string" &&
    (CONSELHO_PROFISSIONAL_VALUES as readonly string[]).includes(value)
  );
}

/** Converte um valor bruto em conselho de domínio. Desconhecido → OUTRO. */
export function toConselho(value: unknown): ConselhoProfissional {
  if (isConselhoProfissional(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase();
    const match = CONSELHO_PROFISSIONAL_VALUES.find(
      (candidate) => candidate.toUpperCase() === normalized,
    );
    if (match) return match;
  }
  return CONSELHO_PROFISSIONAL.OUTRO;
}

export const PROFESSIONAL_ROLE = {
  MEDICO: "MEDICO",
  ENFERMEIRO: "ENFERMEIRO",
  TECNICO_ENFERMAGEM: "TECNICO_ENFERMAGEM",
  BIOMEDICO: "BIOMEDICO",
  DENTISTA: "DENTISTA",
  FISIOTERAPEUTA: "FISIOTERAPEUTA",
  TERAPEUTA_OCUPACIONAL: "TERAPEUTA_OCUPACIONAL",
  FONOAUDIOLOGO: "FONOAUDIOLOGO",
  NUTRICIONISTA: "NUTRICIONISTA",
  PSICOLOGO: "PSICOLOGO",
  FARMACEUTICO: "FARMACEUTICO",
  EDUCADOR_FISICO: "EDUCADOR_FISICO",
  ESTETICISTA: "ESTETICISTA",
  COSMETOLOGO: "COSMETOLOGO",
  TECNICO_RADIOLOGIA: "TECNICO_RADIOLOGIA",
  ADMINISTRATIVO: "ADMINISTRATIVO",
  RECEPCAO: "RECEPCAO",
  GESTOR: "GESTOR",
  OUTRO: "OUTRO",
} as const;

export type ProfessionalRole = (typeof PROFESSIONAL_ROLE)[keyof typeof PROFESSIONAL_ROLE];

export const PROFESSIONAL_ROLE_VALUES = Object.values(PROFESSIONAL_ROLE) as ProfessionalRole[];

export const PROFESSIONAL_ROLE_LABELS: Record<ProfessionalRole, string> = {
  MEDICO: "Médico(a)",
  ENFERMEIRO: "Enfermeiro(a)",
  TECNICO_ENFERMAGEM: "Técnico(a) de Enfermagem",
  BIOMEDICO: "Biomédico(a)",
  DENTISTA: "Dentista",
  FISIOTERAPEUTA: "Fisioterapeuta",
  TERAPEUTA_OCUPACIONAL: "Terapeuta Ocupacional",
  FONOAUDIOLOGO: "Fonoaudiólogo(a)",
  NUTRICIONISTA: "Nutricionista",
  PSICOLOGO: "Psicólogo(a)",
  FARMACEUTICO: "Farmacêutico(a)",
  EDUCADOR_FISICO: "Educador(a) Físico(a)",
  ESTETICISTA: "Esteticista",
  COSMETOLOGO: "Cosmetólogo(a)",
  TECNICO_RADIOLOGIA: "Técnico(a) de Radiologia",
  ADMINISTRATIVO: "Administrativo(a)",
  RECEPCAO: "Recepção",
  GESTOR: "Gestor(a)",
  OUTRO: "Outro",
};

const NON_REGISTRATION_ROLES: ReadonlySet<ProfessionalRole> = new Set([
  PROFESSIONAL_ROLE.ADMINISTRATIVO,
  PROFESSIONAL_ROLE.RECEPCAO,
  PROFESSIONAL_ROLE.GESTOR,
  PROFESSIONAL_ROLE.ESTETICISTA,
  PROFESSIONAL_ROLE.COSMETOLOGO,
  PROFESSIONAL_ROLE.OUTRO,
]);

export function isProfessionalRole(value: unknown): value is ProfessionalRole {
  return (
    typeof value === "string" && (PROFESSIONAL_ROLE_VALUES as readonly string[]).includes(value)
  );
}

/** Converte um valor bruto em papel de domínio. Desconhecido → OUTRO. */
export function toProfessionalRole(value: unknown): ProfessionalRole {
  if (isProfessionalRole(value)) return value;
  if (typeof value === "string") {
    const normalized = value.trim().toUpperCase().replace(/[\s-]/g, "_");
    if (isProfessionalRole(normalized)) return normalized;
  }
  return PROFESSIONAL_ROLE.OUTRO;
}

/** true para papéis vinculados a conselho profissional (uso clínico regulamentado). */
export function requiresRegistration(role: ProfessionalRole): boolean {
  return !NON_REGISTRATION_ROLES.has(role);
}

/** true para papéis de natureza clínica (atendem pacientes diretamente). */
export function isClinicalRole(role: ProfessionalRole): boolean {
  return (
    role !== PROFESSIONAL_ROLE.ADMINISTRATIVO &&
    role !== PROFESSIONAL_ROLE.RECEPCAO &&
    role !== PROFESSIONAL_ROLE.GESTOR
  );
}
