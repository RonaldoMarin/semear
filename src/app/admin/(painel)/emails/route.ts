import type { NextRequest } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { emailConviteMantenedor, emailInscricaoConfirmada, emailInscricaoRecebida, emailListaEspera, emailMensagem, emailRedefinirSenha } from "@/lib/emails/templates";
import { mantenedor } from "@/lib/mantenedor";

/**
 * Prévia dos e-mails automáticos com os dados do próximo evento (só para administradores).
 * /admin/emails?tipo=recebida | espera | vaga | confirmada | mantenedor | mensagem | senha
 */
export async function GET(request: NextRequest) {
  const user = await requireUser("usuarios:gerenciar");
  const tipo = request.nextUrl.searchParams.get("tipo") ?? "recebida";
  const origem = request.nextUrl.origin;

  const evento = await db.evento.findFirst({
    orderBy: [{ dataInicio: "desc" }],
    include: { locais: { orderBy: { ordem: "asc" } }, contatos: { orderBy: { ordem: "asc" } } },
  });

  if (!evento && tipo !== "senha") return new Response("Cadastre um evento para ver a prévia.", { status: 404 });

  const urlEvento = evento ? `${origem}/inscricoes/${evento.slug}` : origem;
  const email =
    tipo === "senha"
      ? emailRedefinirSenha({ nome: user.nome, url: `${origem}/admin/redefinir-senha?token=exemplo`, validadeMinutos: 60 })
      : tipo === "espera"
        ? emailListaEspera({ evento: evento!, nome: "Maria da Silva", protocolo: "AB12CD34", posicao: 3, urlEvento })
        : tipo === "vaga"
          ? emailInscricaoRecebida({ evento: evento!, nome: "Maria da Silva", protocolo: "AB12CD34", urlEvento, vagaLiberada: true })
      : tipo === "mantenedor"
        ? emailConviteMantenedor({
            nome: "Maria da Silva",
            eventoNome: evento!.nome,
            urlMantenedor: `${origem}/mantenedor`,
            chavePix: mantenedor.chavePix,
            valorSugerido: mantenedor.valorSugerido,
            whatsapp: mantenedor.whatsapp,
          })
      : tipo === "confirmada"
        ? emailInscricaoConfirmada({ evento: evento!, nome: "Maria da Silva", protocolo: "AB12CD34", urlEvento })
        : tipo === "mensagem"
          ? emailMensagem({
              nome: "Maria da Silva",
              eventoNome: evento!.nome,
              remetente: user.nome,
              assunto: `Sobre sua inscrição · ${evento!.nome}`,
              mensagem: "Passando para lembrar que o grupo da missão já foi criado.\n\nQualquer dúvida, é só responder este e-mail.",
            })
          : emailInscricaoRecebida({ evento: evento!, nome: "Maria da Silva", protocolo: "AB12CD34", urlEvento });

  return new Response(email.html, { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } });
}
