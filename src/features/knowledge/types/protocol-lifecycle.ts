import { z } from "zod";
import type { ProtocolStatus } from "@/services/protocol.service";
import { PROTOCOL_STATUS_LABELS } from "./protocol-form";

/**
 * Máquina de estados e regras de versionamento dos Protocolos Mestres.
 * Lógica pura, compartilhada entre UI (hooks/componentes) e protocol.service.
 */

export type ProtocolLifecycleStatus = "draft" | "active" | "archived";

export type ProtocolVersionType = "MAJOR" | "MINOR" | "PATCH";

export const PROTOCOL_VERSION_TYPES = ["MAJOR", "MINOR", "PATCH"] as const;

export const PROTOCOL_VERSION_TYPE_LABELS: Record<ProtocolVersionType, string> = {
  MAJOR: "Maior (mudança estruturante)",
  MINOR: "Menor (nova capacidade)",
  PATCH: "Correção (ajuste pontual)",
};

/** Transições permitidas. Qualquer combinação fora deste mapa é rejeitada. */
const TRANSITIONS: Record<ProtocolStatus, ProtocolLifecycleStatus[]> = {
  draft: ["active", "archived"],
  active: ["draft", "archived"],
  archived: ["draft"],
  unknown: ["draft"],
};

export function canTransition(from: ProtocolStatus, to: ProtocolLifecycleStatus): boolean {
  return TRANSITIONS[from].includes(to);
}

export function statusLabel(status: ProtocolStatus): string {
  return status === "unknown" ? "Não classificado" : PROTOCOL_STATUS_LABELS[status];
}

export function transitionErrorMessage(
  from: ProtocolStatus,
  to: ProtocolLifecycleStatus,
): string {
  return `Transição inválida: ${statusLabel(from)} → ${PROTOCOL_STATUS_LABELS[to]}.`;
}

export interface ProtocolStatusAction {
  target: ProtocolLifecycleStatus;
  label: string;
  /** Ação sensível exige modal de confirmação. */
  sensitive: boolean;
  description: string;
}

const STATUS_ACTIONS: Record<ProtocolLifecycleStatus, ProtocolStatusAction> = {
  active: {
    target: "active",
    label: "Publicar",
    sensitive: true,
    description:
      "O protocolo passará a valer como versão oficial e ficará disponível para uso clínico.",
  },
  draft: {
    target: "draft",
    label: "Enviar para revisão",
    sensitive: false,
    description: "O protocolo volta para rascunho e deixa de valer como versão oficial.",
  },
  archived: {
    target: "archived",
    label: "Arquivar",
    sensitive: true,
    description:
      "O protocolo deixa de ser utilizado e passa a constar apenas como registro histórico.",
  },
};

export function availableStatusActions(status: ProtocolStatus): ProtocolStatusAction[] {
  return TRANSITIONS[status].map((target) => STATUS_ACTIONS[target]);
}

/* -------------------------------------------------------------------------- */
/* SemVer                                                                      */
/* -------------------------------------------------------------------------- */

export function parseSemver(version: string | null): [number, number, number] {
  const match = /^\s*v?(\d+)(?:\.(\d+))?(?:\.(\d+))?/.exec(version ?? "");
  if (!match) return [1, 0, 0];
  return [Number(match[1]), Number(match[2] ?? 0), Number(match[3] ?? 0)];
}

export function nextVersion(current: string | null, type: ProtocolVersionType): string {
  const [major, minor, patch] = parseSemver(current);
  if (type === "MAJOR") return `${major + 1}.0.0`;
  if (type === "MINOR") return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/* -------------------------------------------------------------------------- */
/* Duplicação                                                                  */
/* -------------------------------------------------------------------------- */

export function suggestDuplicateName(name: string): string {
  return `${name} (cópia)`.slice(0, 160);
}

export function suggestDuplicateCode(code: string | null): string {
  if (!code) return "";
  return `${code}-COPIA`.slice(0, 40);
}

/* -------------------------------------------------------------------------- */
/* Schemas dos formulários de ciclo de vida                                    */
/* -------------------------------------------------------------------------- */

export const protocolDuplicateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, "Informe ao menos 3 caracteres.")
    .max(160, "Máximo de 160 caracteres."),
  code: z.string().trim().max(40, "Máximo de 40 caracteres."),
});

export type ProtocolDuplicateValues = z.infer<typeof protocolDuplicateSchema>;

export const protocolVersionSchema = z.object({
  versionType: z.enum(PROTOCOL_VERSION_TYPES, { message: "Selecione o tipo de versão." }),
  changes: z
    .string()
    .trim()
    .min(10, "Descreva as alterações com pelo menos 10 caracteres.")
    .max(2000, "Máximo de 2000 caracteres."),
});

export type ProtocolVersionValues = z.infer<typeof protocolVersionSchema>;
