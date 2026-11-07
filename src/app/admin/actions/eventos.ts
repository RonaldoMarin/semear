"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { slugify } from "@/lib/eventos/format";
import { getEventoCompleto, uniqueSlug } from "@/lib/eventos/queries";
import { eventoSchema, flattenErrors, toDatabase, type EventoFormValues, type FieldErrors } from "@/lib/eventos/schema";

export type SaveEventoResult = { ok: true; id: string; message: string } | { ok: false; error: string; fieldErrors?: FieldErrors };

export async function saveEvento(id: string | null, values: EventoFormValues): Promise<SaveEventoResult> {
  const user = await requireUser("eventos:editar");

  const parsed = eventoSchema.safeParse(values);
  if (!parsed.success) {
    return { ok: false, error: "Revise os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }

  const existente = id ? await db.evento.findUnique({ where: { id }, select: { id: true, status: true, slug: true, nome: true } }) : null;
  if (id && !existente) return { ok: false, error: "Evento não encontrado." };

  const { locais, programacao, perguntas, contatos, ...dados } = toDatabase(parsed.data);

  // Voluntários não mudam o status: novos eventos ficam em rascunho e os existentes mantêm o status atual.
  if (!can(user.papel, "eventos:publicar")) {
    dados.status = existente?.status ?? "RASCUNHO";
  }

  const slug = existente && existente.nome === dados.nome ? existente.slug : await uniqueSlug(slugify(dados.nome), existente?.id);

  const filhos = {
    locais: { create: locais },
    programacao: { create: programacao },
    perguntas: { create: perguntas },
    contatos: { create: contatos },
  };

  let eventoId: string;
  if (existente) {
    await db.$transaction([
      db.localEvento.deleteMany({ where: { eventoId: existente.id } }),
      db.programacaoItem.deleteMany({ where: { eventoId: existente.id } }),
      db.perguntaInscricao.deleteMany({ where: { eventoId: existente.id } }),
      db.contatoEvento.deleteMany({ where: { eventoId: existente.id } }),
      db.evento.update({
        where: { id: existente.id },
        data: { ...dados, slug, atualizadoPorId: user.id, ...filhos },
      }),
    ]);
    eventoId = existente.id;
  } else {
    const criado = await db.evento.create({
      data: { ...dados, slug, criadoPorId: user.id, atualizadoPorId: user.id, ...filhos },
    });
    eventoId = criado.id;
  }

  revalidatePath("/admin");
  revalidatePath("/admin/eventos");
  revalidatePath("/");
  revalidatePath("/inscricoes", "layout");
  return { ok: true, id: eventoId, message: existente ? "Alterações salvas." : "Evento criado!" };
}

export async function duplicarEvento(id: string) {
  const user = await requireUser("eventos:editar");
  const original = await getEventoCompleto(id);
  if (!original) return;

  const nome = `${original.nome} (cópia)`;
  const novo = await db.evento.create({
    data: {
      slug: await uniqueSlug(slugify(nome)),
      nome,
      subtitulo: original.subtitulo,
      edicao: original.edicao,
      tipo: original.tipo,
      status: "RASCUNHO",
      destaque: false,
      resumo: original.resumo,
      sobre: original.sobre,
      dataInicio: original.dataInicio,
      dataFim: original.dataFim,
      inscricaoInicio: original.inscricaoInicio,
      inscricaoFim: original.inscricaoFim,
      vagas: original.vagas,
      idadeMinima: original.idadeMinima,
      requisitos: original.requisitos,
      imagemUrl: original.imagemUrl,
      videoUrl: original.videoUrl,
      valorInscricaoCentavos: original.valorInscricaoCentavos,
      valorPreInscricaoCentavos: original.valorPreInscricaoCentavos,
      prazoPreInscricaoDias: original.prazoPreInscricaoDias,
      informacoesPagamento: original.informacoesPagamento,
      politicaCancelamento: original.politicaCancelamento,
      checklist: original.checklist,
      criadoPorId: user.id,
      atualizadoPorId: user.id,
      locais: { create: original.locais.map(({ etapa, nome, endereco, cidade, uf, ordem }) => ({ etapa, nome, endereco, cidade, uf, ordem })) },
      programacao: { create: original.programacao.map(({ titulo, inicio, fim, descricao, ordem }) => ({ titulo, inicio, fim, descricao, ordem })) },
      perguntas: { create: original.perguntas.map(({ id, chave, secao, condicaoChave, condicaoValor, label, ajuda, tipo, opcoes, obrigatoria, ordem }) => ({ chave: chave ?? id, secao, condicaoChave, condicaoValor, label, ajuda, tipo, opcoes, obrigatoria, ordem })) },
      contatos: { create: original.contatos.map(({ nome, funcao, telefone, whatsapp, ordem }) => ({ nome, funcao, telefone, whatsapp, ordem })) },
    },
  });

  revalidatePath("/admin/eventos");
  redirect(`/admin/eventos/${novo.id}?duplicado=1`);
}

export async function excluirEvento(id: string) {
  await requireUser("eventos:excluir");
  await db.evento.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin");
  revalidatePath("/admin/eventos");
  revalidatePath("/");
  revalidatePath("/inscricoes", "layout");
}
