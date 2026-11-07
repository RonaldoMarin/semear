import "server-only";
import { db } from "@/lib/db";
import { enviarEmail } from "@/lib/email";
import { ehEmailDeTeste } from "@/lib/email-teste";
import { emailConviteMantenedor } from "@/lib/emails/templates";
import { mantenedor } from "@/lib/mantenedor";

const DIA = 24 * 60 * 60 * 1000;
/** Eventos que terminaram há mais que isso não recebem mais o convite (evita disparar para eventos antigos). */
const JANELA_MAXIMA_DIAS = 14;

export interface ResultadoConvites {
  eventos: { nome: string; enviados: number; falhas: number; ignorados: number; concluido: boolean }[];
}

function urlDoSite() {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
}

/**
 * Envia o convite do Plano Mantenedor para os inscritos CONFIRMADOS de cada evento
 * que terminou há pelo menos 1 dia. Pode rodar várias vezes: cada pessoa recebe uma vez só,
 * e quem falhou é tentado de novo na próxima execução.
 */
export async function enviarConvitesMantenedor(agora = new Date()): Promise<ResultadoConvites> {
  const eventos = await db.evento.findMany({
    where: {
      emailMantenedorEnviadoEm: null,
      status: { not: "CANCELADO" },
      dataFim: { lte: new Date(agora.getTime() - DIA), gte: new Date(agora.getTime() - JANELA_MAXIMA_DIAS * DIA) },
    },
    select: { id: true, nome: true },
  });

  const resultado: ResultadoConvites = { eventos: [] };

  for (const evento of eventos) {
    const inscricoes = await db.inscricao.findMany({
      where: { eventoId: evento.id, status: "CONFIRMADA", emailMantenedorEm: null, email: { not: null } },
      select: { id: true, nome: true, email: true },
      orderBy: { criadoEm: "asc" },
    });

    let enviados = 0;
    let falhas = 0;
    let ignorados = 0;

    for (const inscricao of inscricoes) {
      const email = emailConviteMantenedor({
        nome: inscricao.nome,
        eventoNome: evento.nome,
        urlMantenedor: `${urlDoSite()}/mantenedor`,
        chavePix: mantenedor.chavePix,
        valorSugerido: mantenedor.valorSugerido,
        whatsapp: mantenedor.whatsapp,
      });

      try {
        const { enviado } = await enviarEmail({ para: inscricao.email!, ...email });
        if (enviado || ehEmailDeTeste(inscricao.email)) {
          // endereços de teste contam como "tratados" para não ficarem sendo tentados para sempre
          await db.inscricao.update({ where: { id: inscricao.id }, data: { emailMantenedorEm: new Date() } });
          if (enviado) enviados++;
          else ignorados++;
        } else {
          falhas++; // SMTP não configurado: tenta de novo depois
        }
      } catch (error) {
        console.error(`[mantenedor] falha ao enviar para inscrição ${inscricao.id}`, error);
        falhas++;
      }
      // pausa curta entre envios para não esbarrar nos limites do Gmail
      await new Promise((r) => setTimeout(r, 400));
    }

    const concluido = falhas === 0;
    if (concluido) await db.evento.update({ where: { id: evento.id }, data: { emailMantenedorEnviadoEm: new Date() } });
    resultado.eventos.push({ nome: evento.nome, enviados, falhas, ignorados, concluido });
    console.info(`[mantenedor] ${evento.nome}: ${enviados} enviados, ${ignorados} de teste, ${falhas} falhas`);
  }

  return resultado;
}
