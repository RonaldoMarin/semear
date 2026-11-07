"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Papel } from "@prisma/client";
import { db } from "@/lib/db";
import { isAdminEmail } from "@/lib/auth/admin-emails";
import { enviarLinkSenha } from "@/lib/auth/link-senha";
import { requireUser } from "@/lib/auth/guards";

export type ConviteState = { ok?: boolean; message?: string; error?: string; fieldErrors?: Partial<Record<"nome" | "email" | "papel", string>> };

const papeis = ["ACESSO", "VOLUNTARIO", "ADM"] as const;

const conviteSchema = z.object({
  nome: z.string().trim().min(3, "Informe o nome.").max(120),
  email: z.string().trim().toLowerCase().email("E-mail inválido."),
  papel: z.enum(papeis),
});

/** Cadastra o e-mail como convite (sem senha). A pessoa cria a senha em /admin/cadastro. */
export async function convidarUsuario(_prev: ConviteState | undefined, formData: FormData): Promise<ConviteState> {
  await requireUser("usuarios:gerenciar");
  const parsed = conviteSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    const fieldErrors: ConviteState["fieldErrors"] = {};
    for (const issue of parsed.error.issues) fieldErrors[issue.path[0] as "nome"] ??= issue.message;
    return { fieldErrors };
  }

  const existe = await db.usuario.findUnique({ where: { email: parsed.data.email } });
  if (existe) return { error: "Já existe um usuário com este e-mail." };

  const criado = await db.usuario.create({ data: { ...parsed.data, papel: isAdminEmail(parsed.data.email) ? "ADM" : parsed.data.papel } });
  await enviarLinkSenha(criado);
  revalidatePath("/admin/usuarios");
  return { ok: true, message: `${parsed.data.nome} foi liberado. Enviamos um e-mail para ${parsed.data.email} criar a senha (o link vale 24 h; se expirar, é só pedir de novo em /admin/cadastro).` };
}

async function alvoEditavel(id: string) {
  const user = await requireUser("usuarios:gerenciar");
  const alvo = await db.usuario.findUnique({ where: { id } });
  if (!alvo) throw new Error("Usuário não encontrado.");
  if (alvo.id === user.id) throw new Error("Você não pode alterar o seu próprio acesso.");
  if (isAdminEmail(alvo.email)) throw new Error("Este administrador está definido no ADMIN_EMAILS do servidor.");
  return alvo;
}

export async function alterarPapel(id: string, papel: Papel) {
  if (!papeis.includes(papel)) return;
  await alvoEditavel(id);
  await db.usuario.update({ where: { id }, data: { papel } });
  revalidatePath("/admin/usuarios");
}

export async function alternarAtivo(id: string) {
  const alvo = await alvoEditavel(id);
  await db.$transaction([
    db.usuario.update({ where: { id }, data: { ativo: !alvo.ativo } }),
    // ao desativar, derruba as sessões abertas
    ...(alvo.ativo ? [db.sessao.deleteMany({ where: { usuarioId: id } })] : []),
  ]);
  revalidatePath("/admin/usuarios");
}

export async function removerConvite(id: string) {
  const alvo = await alvoEditavel(id);
  if (alvo.senhaHash) throw new Error("Só convites pendentes podem ser removidos. Desative o acesso.");
  await db.usuario.delete({ where: { id } });
  revalidatePath("/admin/usuarios");
}
