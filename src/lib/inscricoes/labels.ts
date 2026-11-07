import type { StatusInscricao } from "@prisma/client";

export const statusInscricaoLabel: Record<StatusInscricao, string> = {
  PENDENTE: "Pendente",
  CONFIRMADA: "Confirmada",
  LISTA_ESPERA: "Lista de espera",
  CANCELADA: "Cancelada",
};

/** Situações que ocupam vaga no evento (lista de espera e canceladas não ocupam). */
export const STATUS_OCUPA_VAGA: StatusInscricao[] = ["PENDENTE", "CONFIRMADA"];
