"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { enviarLinkSenha, hashTokenSenha } from "@/lib/auth/link-senha";
import { hashPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { HORA, ipDoVisitante, permitir } from "@/lib/limite";

const hashToken = hashTokenSenha;

export type EsqueciState = { enviado?: boolean; email?: string; error?: string };
export type RedefinirState = { error?: string; fieldErrors?: Partial<Record<"senha" | "confirmacao", string>> };

/**
 * Pede o link de redefinição. A resposta é sempre a mesma (exista o e-mail ou não),
 * para não revelar quem tem conta no painel.
 */
export async function solicitarRedefinicao(_prev: EsqueciState | undefined, formData: FormData): Promise<EsqueciState> {
  const parsed = z.string().trim().toLowerCase().email().safeParse(formData.get("email"));
  if (!parsed.success) return { error: "Informe um e-mail válido." };
  const email = parsed.data;
  if (!permitir(`senha:ip:${await ipDoVisitante()}`, 10, HORA)) return { error: "Muitos pedidos seguidos. Tente de novo mais tarde." };

  const usuario = await db.usuario.findUnique({ where: { email }, select: { id: true, nome: true, email: true, ativo: true, senhaHash: true } });
  if (usuario?.ativo && usuario.senhaHash) await enviarLinkSenha(usuario);

  return { enviado: true, email };
}

async function buscarPedidoValido(token: string) {
  if (!token) return null;
  const pedido = await db.redefinicaoSenha.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: { select: { id: true, ativo: true, email: true, senhaHash: true } } },
  });
  if (!pedido || pedido.usadoEm || pedido.expiraEm < new Date() || !pedido.usuario.ativo) return null;
  return pedido;
}

/** Usado pela página para avisar logo de cara se o link já expirou. */
export async function verificarToken(token: string) {
  const pedido = await buscarPedidoValido(token);
  return pedido ? { valido: true as const, email: pedido.usuario.email, primeiroAcesso: !pedido.usuario.senhaHash } : { valido: false as const };
}

const senhaSchema = z
  .object({
    token: z.string().min(10),
    senha: z
      .string()
      .min(8, "A senha precisa ter pelo menos 8 caracteres.")
      .max(128)
      .regex(/[A-Za-z]/, "Use pelo menos uma letra.")
      .regex(/\d/, "Use pelo menos um número."),
    confirmacao: z.string(),
  })
  .refine((d) => d.senha === d.confirmacao, { path: ["confirmacao"], message: "As senhas não conferem." });

export async function redefinirSenha(_prev: RedefinirState | undefined, formData: FormData): Promise<RedefinirState> {
  const parsed = senhaSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: RedefinirState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) {
      const campo = issue.path[0];
      if ((campo === "senha" || campo === "confirmacao") && !fieldErrors[campo]) fieldErrors[campo] = issue.message;
    }
    return Object.keys(fieldErrors).length ? { fieldErrors } : { error: "Link inválido. Peça um novo." };
  }

  const pedido = await buscarPedidoValido(parsed.data.token);
  if (!pedido) return { error: "Este link expirou ou já foi usado. Peça um novo link." };

  const senhaHash = await hashPassword(parsed.data.senha);
  await db.$transaction([
    // e-mails do ADMIN_EMAILS sempre ficam como ADM
    db.usuario.update({ where: { id: pedido.usuarioId }, data: { senhaHash, ...(isAdminEmail(pedido.usuario.email) ? { papel: "ADM" as const } : {}) } }),
    // invalida este e qualquer outro link pendente, e derruba sessões abertas em outros aparelhos
    db.redefinicaoSenha.updateMany({ where: { usuarioId: pedido.usuarioId, usadoEm: null }, data: { usadoEm: new Date() } }),
    db.sessao.deleteMany({ where: { usuarioId: pedido.usuarioId } }),
  ]);

  await createSession(pedido.usuarioId);
  redirect(pedido.usuario.senhaHash ? "/admin?senha=redefinida" : "/admin");
}
