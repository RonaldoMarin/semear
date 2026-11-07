import type { Papel } from "@prisma/client";

/**
 * Matriz de permissões do painel.
 * - ACESSO: só visualiza (painel e eventos).
 * - VOLUNTARIO: cria e edita eventos (não publica nem exclui).
 * - ADM: acesso total, inclusive publicar/excluir eventos e gerenciar usuários.
 */
const permissions = {
  "eventos:ver": ["ACESSO", "VOLUNTARIO", "ADM"],
  "eventos:editar": ["VOLUNTARIO", "ADM"],
  "eventos:publicar": ["ADM"],
  "eventos:excluir": ["ADM"],
  // inscrições têm dados pessoais (CPF, telefone): acesso básico não vê
  "inscricoes:ver": ["VOLUNTARIO", "ADM"],
  "inscricoes:gerenciar": ["VOLUNTARIO", "ADM"],
  // loja: voluntários cuidam do catálogo; o número de WhatsApp dos pedidos só o ADM muda
  "loja:gerenciar": ["VOLUNTARIO", "ADM"],
  "loja:configurar": ["ADM"],
  "usuarios:gerenciar": ["ADM"],
} as const satisfies Record<string, readonly Papel[]>;

export type Permissao = keyof typeof permissions;

export function can(papel: Papel, permissao: Permissao): boolean {
  return (permissions[permissao] as readonly Papel[]).includes(papel);
}

export const papelLabel: Record<Papel, string> = {
  ACESSO: "Acesso básico",
  VOLUNTARIO: "Voluntário",
  ADM: "Administrador",
};

export const papelDescricao: Record<Papel, string> = {
  ACESSO: "Visualiza o painel e os eventos.",
  VOLUNTARIO: "Cria e edita eventos, sem publicar ou excluir.",
  ADM: "Acesso total: publica, exclui e gerencia usuários.",
};
