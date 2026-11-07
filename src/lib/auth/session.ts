import "server-only";
import { createHash, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { cache } from "react";
import { db } from "@/lib/db";

const COOKIE_NAME = "semear_sessao";
const SESSION_DAYS = 30;

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Cria uma sessão no banco e grava o token no cookie (httpOnly).
 * Só o hash do token fica salvo — se o banco vazar, as sessões não podem ser reaproveitadas.
 */
export async function createSession(usuarioId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiraEm = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000);

  await db.sessao.create({ data: { tokenHash: hashToken(token), usuarioId, expiraEm } });
  await db.usuario.update({ where: { id: usuarioId }, data: { ultimoAcessoEm: new Date() } });

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiraEm,
  });
}

export async function deleteSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (token) await db.sessao.deleteMany({ where: { tokenHash: hashToken(token) } });
  cookieStore.delete(COOKIE_NAME);
}

/** Usuário logado (ou null). Memoizado por requisição. */
export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  const sessao = await db.sessao.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { usuario: { select: { id: true, nome: true, email: true, papel: true, ativo: true } } },
  });

  if (!sessao || sessao.expiraEm < new Date() || !sessao.usuario.ativo) return null;
  return sessao.usuario;
});

export type CurrentUser = NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>;
