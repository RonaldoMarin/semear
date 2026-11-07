import "server-only";
import type { Prisma, StatusEvento } from "@prisma/client";
import { db } from "@/lib/db";
import { STATUS_OCUPA_VAGA } from "./labels";

/** Status que aparecem no site (rascunho e cancelado ficam só no painel). */
export const statusPublicos: StatusEvento[] = ["EM_BREVE", "INSCRICOES_ABERTAS", "INSCRICOES_ENCERRADAS", "REALIZADO"];

const eventoPublicoInclude = {
  locais: { orderBy: { ordem: "asc" } },
  programacao: { orderBy: { ordem: "asc" } },
  perguntas: { orderBy: { ordem: "asc" } },
  contatos: { orderBy: { ordem: "asc" } },
} satisfies Prisma.EventoInclude;

export type EventoPublico = Prisma.EventoGetPayload<{ include: typeof eventoPublicoInclude }>;

export function getEventoPublico(slug: string) {
  return db.evento.findFirst({ where: { slug, status: { in: statusPublicos } }, include: eventoPublicoInclude });
}

export function contarInscritos(eventoId: string) {
  return db.inscricao.count({ where: { eventoId, status: { in: STATUS_OCUPA_VAGA } } });
}

export type SituacaoInscricao =
  /** listaEspera: vagas esgotadas, mas ainda dá para entrar na lista de espera */
  | { aberta: true; listaEspera: boolean; vagasRestantes: number | null }
  | { aberta: false; motivo: string; vagasRestantes: number | null };

/** Regras de abertura: status e janela de datas. Vagas esgotadas viram lista de espera (não fecham). */
export function situacaoInscricao(
  evento: Pick<EventoPublico, "status" | "inscricaoInicio" | "inscricaoFim" | "dataInicio" | "vagas">,
  inscritos: number,
  agora = new Date(),
): SituacaoInscricao {
  const vagasRestantes = evento.vagas == null ? null : Math.max(0, evento.vagas - inscritos);

  if (evento.status === "EM_BREVE") return { aberta: false, motivo: "As inscrições ainda não foram abertas.", vagasRestantes };
  if (evento.status !== "INSCRICOES_ABERTAS") return { aberta: false, motivo: "As inscrições para este evento estão encerradas.", vagasRestantes };
  if (evento.inscricaoInicio && agora < evento.inscricaoInicio) return { aberta: false, motivo: "As inscrições ainda não começaram.", vagasRestantes };
  if (evento.inscricaoFim && agora > evento.inscricaoFim) return { aberta: false, motivo: "O prazo de inscrição terminou.", vagasRestantes };
  if (agora > evento.dataInicio) return { aberta: false, motivo: "Este evento já começou.", vagasRestantes };
  return { aberta: true, listaEspera: vagasRestantes === 0, vagasRestantes };
}

/** Evento em destaque para a página inicial: o próximo com inscrições abertas (ou em breve). Nunca derruba a home. */
export async function getProximoEventoPublico() {
  try {
    const evento = await db.evento.findFirst({
      where: { status: { in: ["INSCRICOES_ABERTAS", "EM_BREVE"] }, dataFim: { gte: new Date() } },
      // enum segue a ordem do schema: "desc" coloca INSCRICOES_ABERTAS antes de EM_BREVE
      orderBy: [{ status: "desc" }, { destaque: "desc" }, { dataInicio: "asc" }],
      include: { locais: { orderBy: { ordem: "asc" } } },
    });
    if (!evento) return null;
    const inscritos = await contarInscritos(evento.id);
    return { evento, situacao: situacaoInscricao(evento, inscritos) };
  } catch (error) {
    console.error("[home] não foi possível carregar o próximo evento", error);
    return null;
  }
}
