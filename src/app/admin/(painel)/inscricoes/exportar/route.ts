import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { formatDateTime, slugify } from "@/lib/eventos/format";
import { lerFiltros, whereCompleto } from "@/lib/inscricoes/filtros";
import { statusInscricaoLabel } from "@/lib/inscricoes/labels";
import type { RespostaSalva } from "@/lib/inscricoes/validacao";

/** Escapa um valor para CSV (separador ";" — abre direto no Excel em português). */
function cell(value: unknown) {
  let text = Array.isArray(value) ? value.join(", ") : String(value ?? "");
  // evita que planilhas interpretem respostas como fórmulas
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

const valorPlanilha = (r: RespostaSalva) =>
  r.tipo === "DATA" && typeof r.valor === "string" && /^\d{4}-\d{2}-\d{2}$/.test(r.valor) ? r.valor.split("-").reverse().join("/") : r.valor;

/** Exporta as inscrições com os mesmos filtros da tela. */
export async function GET(request: NextRequest) {
  await requireUser("inscricoes:ver");
  const filtros = lerFiltros(Object.fromEntries(request.nextUrl.searchParams));

  const inscricoes = await db.inscricao.findMany({
    where: whereCompleto(filtros),
    orderBy: { criadoEm: "asc" },
    include: { evento: { select: { nome: true, perguntas: { orderBy: { ordem: "asc" }, select: { label: true } } } } },
  });

  // colunas: perguntas atuais dos eventos + perguntas antigas que só existem em inscrições anteriores
  const colunas: string[] = [];
  const adicionar = (label: string) => !colunas.includes(label) && colunas.push(label);
  for (const i of inscricoes) i.evento.perguntas.forEach((p) => adicionar(p.label));
  for (const i of inscricoes) (i.respostas as unknown as RespostaSalva[]).forEach((r) => adicionar(r.label));

  const linhas = [
    ["Protocolo", "Evento", "Situação", "Data da inscrição", ...colunas].map(cell).join(";"),
    ...inscricoes.map((i) => {
      const respostas = new Map((i.respostas as unknown as RespostaSalva[]).map((r) => [r.label, valorPlanilha(r)]));
      return [i.id.slice(-8).toUpperCase(), i.evento.nome, statusInscricaoLabel[i.status], formatDateTime(i.criadoEm), ...colunas.map((c) => respostas.get(c) ?? "")]
        .map(cell)
        .join(";");
    }),
  ];

  const nome = filtros.evento && inscricoes[0] ? slugify(inscricoes[0].evento.nome) : "todas";
  // BOM para o Excel reconhecer acentos
  return new Response("﻿" + linhas.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="inscricoes-${nome}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
