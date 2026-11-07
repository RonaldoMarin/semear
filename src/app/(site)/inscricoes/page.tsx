import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/content";
import { db } from "@/lib/db";
import { formatDateRange, formatMoney } from "@/lib/eventos/format";
import { statusEventoLabel } from "@/lib/eventos/labels";
import styles from "./inscricoes.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Inscrições", description: "Inscrições abertas para as próximas missões do Semear no Sertão." };

export default async function InscricoesPage() {
  const eventos = await db.evento.findMany({
    where: { status: { in: ["INSCRICOES_ABERTAS", "EM_BREVE"] }, dataFim: { gte: new Date() } },
    orderBy: [{ status: "desc" }, { dataInicio: "asc" }],
    include: { locais: { orderBy: { ordem: "asc" }, take: 2 } },
  });

  // um único evento com inscrições abertas: vai direto para o formulário
  const abertos = eventos.filter((e) => e.status === "INSCRICOES_ABERTAS");
  if (abertos.length === 1) redirect(`/inscricoes/${abertos[0].slug}`);

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.kicker}>Inscrições</p>
          <h1>Escolha a próxima missão</h1>
          <p className={styles.subtitle}>Veja os eventos com inscrições abertas e os que estão chegando.</p>
        </div>
        <span className={styles.heroSeed} aria-hidden="true" />
      </section>

      <div className={`container ${styles.listWrap}`}>
        {eventos.length === 0 ? (
          <div className={styles.closedCard}>
            <h2>Nenhuma inscrição aberta no momento</h2>
            <p>Assim que a próxima missão for anunciada ela aparece aqui. Acompanhe pelo Instagram ou fale com a secretaria.</p>
            <div className={styles.actions}>
              <a className="button button-dark" href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" /> Falar no WhatsApp
              </a>
              <a className="button button-outline" href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer">
                <Icon name="instagram" /> Instagram
              </a>
            </div>
          </div>
        ) : (
          <ul className={styles.eventList}>
            {eventos.map((evento) => (
              <li key={evento.id}>
                <Link href={`/inscricoes/${evento.slug}`} className={styles.eventCard}>
                  <span className={styles.status} data-open={evento.status === "INSCRICOES_ABERTAS"}>
                    {statusEventoLabel[evento.status]}
                  </span>
                  <h2>{evento.nome}</h2>
                  {evento.resumo && <p>{evento.resumo}</p>}
                  <ul className={styles.meta}>
                    <li>{formatDateRange(evento.dataInicio, evento.dataFim)}</li>
                    {evento.locais[0] && <li>{evento.locais.map((l) => l.cidade ?? l.nome).join(" → ")}</li>}
                    <li>{evento.valorInscricaoCentavos ? formatMoney(evento.valorInscricaoCentavos) : "Gratuito"}</li>
                  </ul>
                  <span className="text-link">
                    {evento.status === "INSCRICOES_ABERTAS" ? "Fazer inscrição" : "Ver detalhes"} <Icon name="arrow" size={18} />
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
