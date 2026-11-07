"use server";

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import { db } from "@/lib/db";
import { enviarEmailSeguro } from "@/lib/email";
import { emailInscricaoRecebida, emailListaEspera } from "@/lib/emails/templates";
import { STATUS_OCUPA_VAGA } from "@/lib/inscricoes/labels";
import { HORA, ipDoVisitante, permitir } from "@/lib/limite";
import { origemDoSite } from "@/lib/site-url";
import { getEventoPublico, situacaoInscricao } from "@/lib/inscricoes/publico";
import { extrairIdentificacao, onlyDigits, validarRespostas, type RespostasBrutas } from "@/lib/inscricoes/validacao";

/** Erro de regra de negócio, com mensagem segura para mostrar ao inscrito. */
class RegraInscricaoError extends Error {}

export type InscricaoResult =
  | { ok: true; protocolo: string; nome: string | null; listaEspera: boolean; posicao: number | null }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function inscrever(slug: string, brutas: RespostasBrutas): Promise<InscricaoResult> {
  // evita robôs enchendo as vagas ou disparando e-mails em massa
  if (!permitir(`inscricao:ip:${await ipDoVisitante()}`, 10, HORA)) {
    return { ok: false, error: "Muitas inscrições enviadas deste aparelho. Tente de novo mais tarde ou fale com a secretaria." };
  }
  const evento = await getEventoPublico(slug);
  if (!evento) return { ok: false, error: "Evento não encontrado." };

  // respostas para perguntas que não existem mais = formulário mudou enquanto a pessoa preenchia
  const idsAtuais = new Set(evento.perguntas.map((p) => p.id));
  if (Object.keys(brutas).some((id) => !idsAtuais.has(id))) {
    return { ok: false, error: "O formulário foi atualizado pela coordenação. Recarregue a página e confira suas respostas." };
  }

  const { ok, erros, respostas } = validarRespostas(evento.perguntas, brutas, {
    idadeMinima: evento.idadeMinima,
    dataReferencia: evento.dataInicio.toISOString(),
  });
  if (!ok) return { ok: false, error: "Confira os campos destacados.", fieldErrors: erros };

  const id = extrairIdentificacao(respostas);

  try {
    const criada = await db.$transaction(async (tx) => {
      const inscritos = await tx.inscricao.count({ where: { eventoId: evento.id, status: { in: STATUS_OCUPA_VAGA } } });
      const situacao = situacaoInscricao(evento, inscritos);
      if (!situacao.aberta) throw new RegraInscricaoError(situacao.motivo);
      // vagas esgotadas: a inscrição entra na lista de espera (sem ocupar vaga nem pedir pagamento)
      const listaEspera = situacao.listaEspera;

      if (id.cpf || id.email) {
        const duplicada = await tx.inscricao.findFirst({
          where: {
            eventoId: evento.id,
            status: { not: "CANCELADA" },
            OR: [...(id.cpf ? [{ cpf: id.cpf }] : []), ...(id.email ? [{ email: id.email }] : [])],
          },
          select: { id: true },
        });
        if (duplicada) throw new RegraInscricaoError("Já existe uma inscrição com este CPF ou e-mail. Se precisar corrigir algo, fale com a secretaria.");
      }

      const criada = await tx.inscricao.create({
        data: {
          eventoId: evento.id,
          ...id,
          status: listaEspera ? "LISTA_ESPERA" : "PENDENTE",
          respostas: JSON.parse(JSON.stringify(respostas)),
        },
        select: { id: true },
      });
      const posicao = listaEspera ? await tx.inscricao.count({ where: { eventoId: evento.id, status: "LISTA_ESPERA" } }) : null;
      return { ...criada, listaEspera, posicao };
    });

    const protocolo = criada.id.slice(-8).toUpperCase();
    revalidatePath(`/inscricoes/${slug}`);
    revalidatePath("/");

    // e-mail de confirmação de recebimento: enviado depois da resposta, sem atrasar a tela
    if (id.email) {
      const para = id.email;
      const urlEvento = `${await origemDoSite()}/inscricoes/${slug}`;
      after(async () => {
        const email = criada.listaEspera
          ? emailListaEspera({ evento, nome: id.nome, protocolo, posicao: criada.posicao ?? 1, urlEvento })
          : emailInscricaoRecebida({ evento, nome: id.nome, protocolo, urlEvento });
        await enviarEmailSeguro({ para, ...email }, `${criada.listaEspera ? "lista de espera" : "inscrição recebida"} ${protocolo}`);
      });
    }

    return { ok: true, protocolo, nome: id.nome, listaEspera: criada.listaEspera, posicao: criada.posicao };
  } catch (error) {
    if (error instanceof RegraInscricaoError) return { ok: false, error: error.message };
    console.error("[inscricao] falha ao salvar", error, { slug, cpf: id.cpf ? onlyDigits(id.cpf).slice(-3) : null });
    return { ok: false, error: "Não foi possível concluir a inscrição agora. Tente novamente em instantes." };
  }
}
