import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";
import { enviarConvitesMantenedor } from "@/lib/tarefas/convite-mantenedor";

export const dynamic = "force-dynamic";

function autorizado(request: NextRequest) {
  const segredo = process.env.CRON_SECRET;
  if (!segredo) return false;
  // só pelo cabeçalho: senha na URL fica gravada em logs de acesso e histórico
  const recebido = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ?? "";
  const a = Buffer.from(recebido);
  const b = Buffer.from(segredo);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Dispara o convite do Plano Mantenedor (para cron externo ou execução manual).
 * Uso: GET /api/tarefas/convite-mantenedor com o cabeçalho "Authorization: Bearer <CRON_SECRET>"
 *      (ex.: curl -H "Authorization: Bearer $CRON_SECRET" https://seusite/api/tarefas/convite-mantenedor).
 */
export async function GET(request: NextRequest) {
  if (!process.env.CRON_SECRET) return Response.json({ erro: "Defina CRON_SECRET no .env para usar esta rota." }, { status: 503 });
  if (!autorizado(request)) return Response.json({ erro: "Não autorizado." }, { status: 401 });
  const resultado = await enviarConvitesMantenedor();
  return Response.json(resultado);
}
