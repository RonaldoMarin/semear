"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { StatusInscricao } from "@prisma/client";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { enviarEmailSeguro } from "@/lib/email";
import { ehEmailDeTeste } from "@/lib/email-teste";
import { fromLocalInput } from "@/lib/eventos/format";
import { emailInscricaoConfirmada, emailInscricaoRecebida, emailMensagem } from "@/lib/emails/templates";
import { origemDoSite } from "@/lib/site-url";

const status: StatusInscricao[] = ["PENDENTE", "CONFIRMADA", "LISTA_ESPERA", "CANCELADA"];

const eventoParaEmail = {
  select: {
    nome: true,
    slug: true,
    edicao: true,
    dataInicio: true,
    dataFim: true,
    valorInscricaoCentavos: true,
    valorPreInscricaoCentavos: true,
    prazoPreInscricaoDias: true,
    informacoesPagamento: true,
    politicaCancelamento: true,
    checklist: true,
    locais: { orderBy: { ordem: "asc" as const }, select: { etapa: true, nome: true, endereco: true, cidade: true, uf: true } },
    contatos: { orderBy: { ordem: "asc" as const }, select: { nome: true, funcao: true, telefone: true, whatsapp: true } },
  },
};

export type AlterarStatusResult = { ok: true; emailEnviado: boolean } | { ok: false; error: string };

export async function alterarStatusInscricao(id: string, novo: StatusInscricao, opcoes: { notificar?: boolean } = {}): Promise<AlterarStatusResult> {
  await requireUser("inscricoes:gerenciar");
  if (!status.includes(novo)) return { ok: false, error: "Situação inválida." };

  const anterior = await db.inscricao.findUnique({ where: { id }, select: { status: true } });
  if (!anterior) return { ok: false, error: "Inscrição não encontrada." };

  const inscricao = await db.inscricao.update({
    where: { id },
    data: { status: novo },
    select: { id: true, nome: true, email: true, evento: eventoParaEmail },
  });

  let emailEnviado = false;
  const confirmou = novo === "CONFIRMADA" && anterior.status !== "CONFIRMADA";
  const liberouVaga = novo === "PENDENTE" && anterior.status === "LISTA_ESPERA";
  if ((confirmou || liberouVaga) && opcoes.notificar && inscricao.email) {
    const protocolo = inscricao.id.slice(-8).toUpperCase();
    const urlEvento = `${await origemDoSite()}/inscricoes/${inscricao.evento.slug}`;
    const dados = { evento: inscricao.evento, nome: inscricao.nome, protocolo, urlEvento };
    const email = confirmou ? emailInscricaoConfirmada(dados) : emailInscricaoRecebida({ ...dados, vagaLiberada: true });
    emailEnviado = await enviarEmailSeguro({ para: inscricao.email, ...email }, `${confirmou ? "inscrição confirmada" : "vaga liberada"} ${protocolo}`);
  }

  revalidatePath("/admin/inscricoes");
  revalidatePath(`/inscricoes/${inscricao.evento.slug}`);
  revalidatePath("/");
  return { ok: true, emailEnviado };
}

const entrevistaSchema = z.object({
  quando: z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe a data e o horário."),
  link: z
    .string()
    .trim()
    .url("Cole o link completo da reunião (https://...).")
    .refine((v) => v.startsWith("https://"), "O link precisa começar com https://"),
});

export type EntrevistaResult = { ok: true } | { ok: false; error: string };

/** Guarda a entrevista marcada (data e link do Meet) na inscrição. */
export async function salvarEntrevista(id: string, dados: { quando: string; link: string }): Promise<EntrevistaResult> {
  await requireUser("inscricoes:gerenciar");
  const parsed = entrevistaSchema.safeParse(dados);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  await db.inscricao.update({
    where: { id },
    data: { entrevistaEm: fromLocalInput(parsed.data.quando), entrevistaLink: parsed.data.link },
  });
  revalidatePath("/admin/inscricoes");
  return { ok: true };
}

export async function removerEntrevista(id: string) {
  await requireUser("inscricoes:gerenciar");
  await db.inscricao.update({ where: { id }, data: { entrevistaEm: null, entrevistaLink: null } });
  revalidatePath("/admin/inscricoes");
}

const mensagemSchema = z.object({
  assunto: z.string().trim().min(3, "Escreva um assunto.").max(150),
  mensagem: z.string().trim().min(5, "Escreva a mensagem.").max(5000),
});

export type MensagemResult = { ok: true } | { ok: false; error: string };

/** Mensagem livre escrita no painel, enviada pelo e-mail do projeto. */
export async function enviarMensagemInscrito(id: string, dados: { assunto: string; mensagem: string }): Promise<MensagemResult> {
  const user = await requireUser("inscricoes:gerenciar");
  const parsed = mensagemSchema.safeParse(dados);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };

  const inscricao = await db.inscricao.findUnique({ where: { id }, select: { nome: true, email: true, evento: { select: { nome: true } } } });
  if (!inscricao?.email) return { ok: false, error: "Esta inscrição não tem e-mail." };
  if (ehEmailDeTeste(inscricao.email)) return { ok: false, error: `${inscricao.email} é um endereço de teste: nada foi enviado.` };

  const email = emailMensagem({ nome: inscricao.nome, eventoNome: inscricao.evento.nome, remetente: user.nome, ...parsed.data });
  const enviado = await enviarEmailSeguro({ para: inscricao.email, ...email }, `mensagem para inscrito ${id}`);
  return enviado ? { ok: true } : { ok: false, error: "Não foi possível enviar agora. Confira a configuração de e-mail e tente de novo." };
}
