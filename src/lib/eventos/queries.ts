import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";
import { centsToInput, toLocalInput } from "./format";
import type { EventoFormValues } from "./schema";

export const eventoCompletoInclude = {
  locais: { orderBy: { ordem: "asc" } },
  programacao: { orderBy: { ordem: "asc" } },
  perguntas: { orderBy: { ordem: "asc" } },
  contatos: { orderBy: { ordem: "asc" } },
  criadoPor: { select: { nome: true } },
  atualizadoPor: { select: { nome: true } },
} satisfies Prisma.EventoInclude;

export type EventoCompleto = Prisma.EventoGetPayload<{ include: typeof eventoCompletoInclude }>;

export function getEventoCompleto(id: string) {
  return db.evento.findUnique({ where: { id }, include: eventoCompletoInclude });
}

/** Registro do banco → valores do formulário */
export function toFormValues(e: EventoCompleto): EventoFormValues {
  const s = (v: string | null) => v ?? "";
  const n = (v: number | null) => (v == null ? "" : String(v));
  return {
    nome: e.nome,
    subtitulo: s(e.subtitulo),
    edicao: s(e.edicao),
    tipo: e.tipo,
    status: e.status,
    destaque: e.destaque,
    resumo: s(e.resumo),
    sobre: s(e.sobre),
    dataInicio: toLocalInput(e.dataInicio),
    dataFim: toLocalInput(e.dataFim),
    inscricaoInicio: toLocalInput(e.inscricaoInicio),
    inscricaoFim: toLocalInput(e.inscricaoFim),
    vagas: n(e.vagas),
    idadeMinima: n(e.idadeMinima),
    requisitos: s(e.requisitos),
    imagemUrl: s(e.imagemUrl),
    videoUrl: s(e.videoUrl),
    valorInscricao: centsToInput(e.valorInscricaoCentavos),
    valorPreInscricao: centsToInput(e.valorPreInscricaoCentavos),
    prazoPreInscricaoDias: n(e.prazoPreInscricaoDias),
    informacoesPagamento: s(e.informacoesPagamento),
    politicaCancelamento: s(e.politicaCancelamento),
    checklist: s(e.checklist),
    locais: e.locais.map((l) => ({ etapa: s(l.etapa), nome: l.nome, endereco: s(l.endereco), cidade: s(l.cidade), uf: s(l.uf) })),
    programacao: e.programacao.map((p) => ({
      titulo: p.titulo,
      inicio: toLocalInput(p.inicio),
      fim: toLocalInput(p.fim),
      descricao: s(p.descricao),
    })),
    perguntas: e.perguntas.map((p) => ({ chave: p.chave ?? p.id, secao: s(p.secao), condicaoChave: s(p.condicaoChave), condicaoValor: s(p.condicaoValor), label: p.label, ajuda: s(p.ajuda), tipo: p.tipo, opcoes: p.opcoes, obrigatoria: p.obrigatoria })),
    contatos: e.contatos.map((c) => ({ nome: c.nome, funcao: s(c.funcao), telefone: c.telefone, whatsapp: c.whatsapp })),
  };
}

/** Garante slug único: "missao-2027", "missao-2027-2"... */
export async function uniqueSlug(base: string, ignoreId?: string) {
  const root = base || "evento";
  let slug = root;
  for (let i = 2; ; i++) {
    const found = await db.evento.findUnique({ where: { slug }, select: { id: true } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${root}-${i}`;
  }
}
