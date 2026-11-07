"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { enviarLinkSenha } from "@/lib/auth/link-senha";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, deleteSession } from "@/lib/auth/session";
import { HORA, MINUTO, ipDoVisitante, permitir, zerar } from "@/lib/limite";

export type AuthState = {
  error?: string;
  fieldErrors?: Partial<Record<"nome" | "email" | "senha" | "confirmacao", string>>;
  values?: { nome?: string; email?: string };
  /** cadastro: link de criação de senha enviado */
  enviado?: string;
};

const email = z.string().trim().toLowerCase().email("Informe um e-mail válido.");

const loginSchema = z.object({
  email,
  senha: z.string().min(1, "Informe sua senha."),
});

const cadastroSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome completo.").max(120),
  email,
});

/** Hash fixo para comparar quando o e-mail não existe: o login demora o mesmo tempo e não revela quem tem conta. */
let hashFalso: Promise<string> | null = null;

function fieldErrors(error: z.ZodError): AuthState["fieldErrors"] {
  const result: AuthState["fieldErrors"] = {};
  for (const issue of error.issues) {
    const key = issue.path[0] as keyof NonNullable<AuthState["fieldErrors"]>;
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}

export async function login(_prev: AuthState | undefined, formData: FormData): Promise<AuthState> {
  const parsed = loginSchema.safeParse(Object.fromEntries(formData));
  const values = { email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };

  const chaveEmail = `login:email:${parsed.data.email}`;
  const ip = await ipDoVisitante();
  if (!permitir(`login:ip:${ip}`, 30, 15 * MINUTO) || !permitir(chaveEmail, 8, 15 * MINUTO)) {
    return { error: "Muitas tentativas seguidas. Aguarde 15 minutos e tente de novo.", values };
  }

  const usuario = await db.usuario.findUnique({ where: { email: parsed.data.email } });
  hashFalso ??= hashPassword("senha-que-nao-existe-123");
  const ok = await verifyPassword(parsed.data.senha, usuario?.senhaHash ?? (await hashFalso));

  if (!usuario?.senhaHash || !ok) return { error: "E-mail ou senha incorretos.", values };
  if (!usuario.ativo) return { error: "Seu acesso está desativado. Fale com um administrador.", values };

  zerar(chaveEmail);
  await createSession(usuario.id);
  redirect("/admin");
}

/**
 * Primeiro acesso com lista de permissão. A senha NÃO é criada aqui: mandamos um link para o e-mail,
 * e só quem abre a caixa de entrada consegue definir a senha (senão qualquer um que soubesse um
 * e-mail liberado poderia tomar a conta).
 * - e-mail em ADMIN_EMAILS → conta de ADM;
 * - e-mail cadastrado antes por um ADM (convite) → mantém o papel do convite;
 * - qualquer outro e-mail → recusado.
 */
export async function cadastro(_prev: AuthState | undefined, formData: FormData): Promise<AuthState> {
  const parsed = cadastroSchema.safeParse(Object.fromEntries(formData));
  const values = { nome: String(formData.get("nome") ?? ""), email: String(formData.get("email") ?? "") };
  if (!parsed.success) return { fieldErrors: fieldErrors(parsed.error), values };
  if (!permitir(`cadastro:ip:${await ipDoVisitante()}`, 8, HORA)) return { error: "Muitos pedidos seguidos. Tente de novo mais tarde.", values };

  const { nome, email: emailValue } = parsed.data;
  let usuario = await db.usuario.findUnique({ where: { email: emailValue } });

  if (!usuario && isAdminEmail(emailValue)) {
    usuario = await db.usuario.create({ data: { nome, email: emailValue, papel: "ADM" } });
  }
  if (!usuario) {
    return { error: "Este e-mail não tem permissão para criar conta. Peça a um administrador para liberar seu acesso.", values };
  }
  if (!usuario.ativo) return { error: "Este acesso foi desativado. Fale com um administrador.", values };

  // quem já tem senha recebe um link de redefinição; quem é convite recebe o de primeiro acesso
  await enviarLinkSenha(usuario);
  return { enviado: emailValue };
}

export async function logout() {
  await deleteSession();
  redirect("/admin/login");
}
