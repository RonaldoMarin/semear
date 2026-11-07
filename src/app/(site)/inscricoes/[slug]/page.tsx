/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { InscricaoForm } from "@/components/inscricao/InscricaoForm";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/content";
import { formatDate, formatDateRange, formatDateTime, formatMoney } from "@/lib/eventos/format";
import { contarInscritos, getEventoPublico, situacaoInscricao, type EventoPublico } from "@/lib/inscricoes/publico";
import { onlyDigits } from "@/lib/inscricoes/validacao";
import styles from "../inscricoes.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);
  if (!evento) return { title: "Evento não encontrado" };
  return {
    title: `Inscrição · ${evento.nome}`,
    description: evento.resumo ?? `Faça sua inscrição em ${evento.nome}.`,
    openGraph: { title: evento.nome, description: evento.resumo ?? undefined, images: evento.imagemUrl ? [evento.imagemUrl] : undefined },
  };
}

function whatsappLink(telefone: string) {
  const digits = onlyDigits(telefone);
  return `https://wa.me/${digits.startsWith("55") ? digits : `55${digits}`}`;
}

/** Bloco com pagamento, contatos e check-list — aparece na página e depois da inscrição. */
function ProximosPassos({ evento }: { evento: EventoPublico }) {
  const restante =
    evento.valorInscricaoCentavos != null && evento.valorPreInscricaoCentavos != null
      ? evento.valorInscricaoCentavos - evento.valorPreInscricaoCentavos
      : null;

  return (
    <div className={styles.steps}>
      {evento.valorInscricaoCentavos != null && (
        <section className={styles.infoCard}>
          <h3>
            <Icon name="give" size={20} /> Pagamento
          </h3>
          <ul className={styles.payList}>
            <li>
              <span>Taxa de inscrição</span>
              <strong>{formatMoney(evento.valorInscricaoCentavos)}</strong>
            </li>
            {evento.valorPreInscricaoCentavos != null && (
              <li>
                <span>
                  Pré-inscrição
                  {evento.prazoPreInscricaoDias ? ` (em até ${evento.prazoPreInscricaoDias} dias úteis)` : ""}
                </span>
                <strong>{formatMoney(evento.valorPreInscricaoCentavos)}</strong>
              </li>
            )}
            {restante != null && restante > 0 && (
              <li>
                <span>Restante</span>
                <strong>{formatMoney(restante)}</strong>
              </li>
            )}
          </ul>
          {evento.informacoesPagamento && <p className={styles.preline}>{evento.informacoesPagamento}</p>}
          {evento.politicaCancelamento && <p className={styles.note}>{evento.politicaCancelamento}</p>}
        </section>
      )}

      {evento.contatos.length > 0 && (
        <section className={styles.infoCard}>
          <h3>
            <Icon name="whatsapp" size={20} /> Secretaria
          </h3>
          <ul className={styles.contacts}>
            {evento.contatos.map((contato) => (
              <li key={`${contato.nome}-${contato.telefone}`}>
                <span>
                  <strong>{contato.nome}</strong>
                  {contato.funcao && <small>{contato.funcao}</small>}
                </span>
                {contato.whatsapp ? (
                  <a href={whatsappLink(contato.telefone)} target="_blank" rel="noopener noreferrer">
                    {contato.telefone}
                  </a>
                ) : (
                  <a href={`tel:${onlyDigits(contato.telefone)}`}>{contato.telefone}</a>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {evento.checklist && (
        <details className={styles.infoCard}>
          <summary>
            <h3>
              <Icon name="presence" size={20} /> Check-list: o que levar
            </h3>
          </summary>
          <ul className={styles.checklist}>
            {evento.checklist
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item) => (
                <li key={item}>{item}</li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}

export default async function InscricaoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const evento = await getEventoPublico(slug);
  if (!evento) notFound();

  const inscritos = await contarInscritos(evento.id);
  const situacao = situacaoInscricao(evento, inscritos);

  const fatos = [
    { icon: "presence" as const, label: "Quando", valor: formatDateRange(evento.dataInicio, evento.dataFim) },
    evento.locais.length
      ? { icon: "presence" as const, label: "Onde", valor: evento.locais.map((l) => [l.cidade, l.uf].filter(Boolean).join("-") || l.nome).join(" → ") }
      : null,
    { icon: "give" as const, label: "Investimento", valor: evento.valorInscricaoCentavos ? formatMoney(evento.valorInscricaoCentavos) : "Gratuito" },
    situacao.vagasRestantes != null
      ? { icon: "hands" as const, label: "Vagas", valor: situacao.vagasRestantes === 0 ? "Esgotadas · lista de espera" : `${situacao.vagasRestantes} de ${evento.vagas}` }
      : null,
  ].filter(Boolean) as { icon: "presence" | "give" | "hands"; label: string; valor: string }[];

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <Link href="/" className={styles.back}>
            ← Voltar ao site
          </Link>
          <p className={styles.kicker}>{[evento.edicao, "Inscrições"].filter(Boolean).join(" · ")}</p>
          <h1>{evento.nome}</h1>
          {evento.subtitulo && <p className={styles.subtitle}>{evento.subtitulo}</p>}
          <dl className={styles.facts}>
            {fatos.map((fato) => (
              <div key={fato.label}>
                <dt>{fato.label}</dt>
                <dd>{fato.valor}</dd>
              </div>
            ))}
          </dl>
          {situacao.aberta && situacao.listaEspera && (
            <p className={styles.waitlistNote}>
              <strong>As vagas foram preenchidas.</strong> Você ainda pode entrar na <strong>lista de espera</strong>: se alguém desistir, entramos em
              contato seguindo a ordem da fila.
            </p>
          )}
          {situacao.aberta ? (
            <a href="#formulario" className="button button-primary">
              {situacao.listaEspera ? "Entrar na lista de espera" : "Fazer minha inscrição"} <Icon name="arrow" />
            </a>
          ) : (
            <p className={styles.closed}>{situacao.motivo}</p>
          )}
        </div>
        <span className={styles.heroSeed} aria-hidden="true" />
      </section>

      <div className={`container ${styles.layout}`}>
        <aside className={styles.info}>
          {evento.imagemUrl && <img className={styles.cover} src={evento.imagemUrl} alt="" />}

          {(evento.sobre || evento.resumo) && (
            <section className={styles.infoCard}>
              <h3>Sobre</h3>
              <p className={styles.preline}>{evento.sobre ?? evento.resumo}</p>
            </section>
          )}

          {evento.locais.length > 0 && (
            <section className={styles.infoCard}>
              <h3>
                <Icon name="presence" size={20} /> Locais
              </h3>
              <ul className={styles.places}>
                {evento.locais.map((local) => (
                  <li key={`${local.etapa}-${local.nome}`}>
                    {local.etapa && <span className={styles.tag}>{local.etapa}</span>}
                    <strong>{local.nome}</strong>
                    <small>{[local.endereco, [local.cidade, local.uf].filter(Boolean).join("-")].filter(Boolean).join(" · ")}</small>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(evento.idadeMinima != null || evento.requisitos) && (
            <section className={styles.infoCard}>
              <h3>
                <Icon name="hands" size={20} /> Quem pode participar
              </h3>
              <ul className={styles.checklist}>
                {evento.idadeMinima != null && evento.idadeMinima > 0 && <li>Idade mínima de {evento.idadeMinima} anos.</li>}
                {evento.requisitos?.split("\n").filter(Boolean).map((r) => <li key={r}>{r}</li>)}
              </ul>
            </section>
          )}

          {evento.programacao.length > 0 && (
            <section className={styles.infoCard}>
              <h3>Programação</h3>
              <ol className={styles.schedule}>
                {evento.programacao.map((item) => (
                  <li key={`${item.titulo}-${item.inicio.toISOString()}`}>
                    <time>{formatDate(item.inicio, { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</time>
                    <strong>{item.titulo}</strong>
                    {item.descricao && <small>{item.descricao}</small>}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <ProximosPassos evento={evento} />
        </aside>

        <section id="formulario" className={styles.formArea} aria-labelledby="form-title">
          <h2 id="form-title">Formulário de inscrição</h2>
          {situacao.aberta ? (
            evento.perguntas.length > 0 ? (
              <>
                {situacao.listaEspera && (
                  <div className={styles.waitlistCard}>
                    <strong>Inscrição para a lista de espera</strong>
                    <p>
                      As vagas desta edição já foram preenchidas. Ao enviar o formulário você entra na fila, <strong>sem precisar pagar nada agora</strong>.
                      Se uma vaga abrir, a secretaria entra em contato com as instruções de pagamento.
                    </p>
                  </div>
                )}
                {evento.inscricaoFim && <p className={styles.deadline}>Inscrições até {formatDateTime(evento.inscricaoFim)}.</p>}
                <InscricaoForm
                  slug={evento.slug}
                  listaEspera={situacao.listaEspera}
                  perguntas={evento.perguntas.map(({ id, chave, secao, condicaoChave, condicaoValor, label, ajuda, tipo, opcoes, obrigatoria }) => ({ id, chave, secao, condicaoChave, condicaoValor, label, ajuda, tipo, opcoes, obrigatoria }))}
                  regras={{ idadeMinima: evento.idadeMinima, dataReferencia: evento.dataInicio.toISOString() }}
                  pos={{
                    eventoNome: evento.nome,
                    valorPre: evento.valorPreInscricaoCentavos != null ? formatMoney(evento.valorPreInscricaoCentavos) : null,
                    prazoDias: evento.prazoPreInscricaoDias,
                    whatsapp: (() => {
                      const contato = evento.contatos.find((c) => c.whatsapp);
                      return contato ? { nome: contato.nome, telefone: contato.telefone } : null;
                    })(),
                  }}
                  detalhes={<ProximosPassos evento={evento} />}
                />
              </>
            ) : (
              <p className={styles.closedCard}>O formulário deste evento ainda está sendo preparado.</p>
            )
          ) : (
            <div className={styles.closedCard}>
              <p>{situacao.motivo}</p>
              <a className="button button-dark" href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" /> Falar com a secretaria
              </a>
            </div>
          )}
        </section>
      </div>
    </>
  );
}
