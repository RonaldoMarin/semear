import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { db } from "@/lib/db";
import { enviarEmailSeguro } from "@/lib/email";
import { emailCriarSenha, emailRedefinirSenha } from "@/lib/emails/templates";
import { origemDoSite } from "@/lib/site-url";

export const hashTokenSenha = (token: string) => createHash("sha256").update(token).digest("hex");

const MAX_LINKS_POR_HORA = 3;
export const VALIDADE_REDEFINIR_MIN = 60;
export const VALIDADE_PRIMEIRO_ACESSO_MIN = 24 * 60;

/**
 * Envia por e-mail um link único para a pessoa criar (primeiro acesso) ou redefinir a senha.
 * Só quem tem acesso à caixa de entrada consegue definir a senha: é isso que prova que o e-mail é dela.
 */
export async function enviarLinkSenha(usuario: { id: string; nome: string; email: string; senhaHash: string | null }) {
  const recentes = await db.redefinicaoSenha.count({
    where: { usuarioId: usuario.id, criadoEm: { gte: new Date(Date.now() - 60 * 60 * 1000) } },
  });
  if (recentes >= MAX_LINKS_POR_HORA) return;

  const primeiroAcesso = !usuario.senhaHash;
  const validadeMinutos = primeiroAcesso ? VALIDADE_PRIMEIRO_ACESSO_MIN : VALIDADE_REDEFINIR_MIN;
  const token = randomBytes(32).toString("base64url");
  await db.redefinicaoSenha.create({
    data: { tokenHash: hashTokenSenha(token), usuarioId: usuario.id, expiraEm: new Date(Date.now() + validadeMinutos * 60 * 1000) },
  });

  const url = `${await origemDoSite()}/admin/redefinir-senha?token=${token}`;
  const email = primeiroAcesso ? emailCriarSenha({ nome: usuario.nome, url }) : emailRedefinirSenha({ nome: usuario.nome, url, validadeMinutos });
  await enviarEmailSeguro({ para: usuario.email, ...email }, primeiroAcesso ? "primeiro acesso" : "redefinição de senha");
}
