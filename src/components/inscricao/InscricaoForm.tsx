"use client";

import { useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { inscrever } from "@/app/(site)/inscricoes/actions";
import { Icon } from "@/components/ui/Icon";
import { linkWhatsApp } from "@/lib/whatsapp";
import {
  formatCpf,
  formatTelefone,
  montarEtapas,
  perguntaVisivel,
  somarDiasUteis,
  validarRespostas,
  type PerguntaPublica,
  type RegrasInscricao,
  type RespostasBrutas,
  type ValorResposta,
} from "@/lib/inscricoes/validacao";
import styles from "./InscricaoForm.module.css";

interface PosInscricao {
  eventoNome: string;
  /** "R$ 100,00" ou null quando não há pré-inscrição */
  valorPre: string | null;
  prazoDias: number | null;
  whatsapp: { nome: string; telefone: string } | null;
}

interface Props {
  slug: string;
  /** vagas esgotadas: a inscrição vai para a lista de espera */
  listaEspera?: boolean;
  perguntas: PerguntaPublica[];
  regras: RegrasInscricao;
  pos: PosInscricao;
  /** detalhes de pagamento, contatos e check-list (renderizados no servidor) */
  detalhes: React.ReactNode;
}

/* ---------- rascunho no navegador ---------- */

interface Rascunho {
  respostas: RespostasBrutas;
  etapa: number;
  salvoEm: string;
}

const chaveRascunho = (slug: string) => `semear:inscricao:${slug}`;

function lerRascunho(slug: string): string | null {
  try {
    return window.localStorage.getItem(chaveRascunho(slug));
  } catch {
    return null;
  }
}

function salvarRascunho(slug: string, rascunho: Rascunho | null) {
  try {
    if (rascunho) window.localStorage.setItem(chaveRascunho(slug), JSON.stringify(rascunho));
    else window.localStorage.removeItem(chaveRascunho(slug));
  } catch {
    // navegação privada ou armazenamento bloqueado: segue sem rascunho
  }
}

function subscribeStorage(callback: () => void) {
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

/* ---------- helpers ---------- */

function respondida(valor: ValorResposta | undefined) {
  return Array.isArray(valor) ? valor.length > 0 : Boolean(valor?.trim());
}

function formatarResposta(pergunta: PerguntaPublica, valor: ValorResposta | undefined) {
  if (!respondida(valor)) return "—";
  if (Array.isArray(valor)) return valor.join(", ");
  if (pergunta.tipo === "DATA" && /^\d{4}-\d{2}-\d{2}$/.test(valor!)) return valor!.split("-").reverse().join("/");
  return valor!;
}

export function InscricaoForm({ slug, listaEspera = false, perguntas, regras, pos, detalhes }: Props) {
  const etapas = useMemo(() => montarEtapas(perguntas), [perguntas]);
  const totalEtapas = etapas.length + 1; // + revisão
  const numero = useMemo(() => new Map(perguntas.map((p, i) => [p.id, i + 1])), [perguntas]);

  const [respostas, setRespostas] = useState<RespostasBrutas>({});
  const [etapa, setEtapa] = useState(0);
  const [visitadas, setVisitadas] = useState(1);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [concluida, setConcluida] = useState<{ protocolo: string; nome: string | null; listaEspera: boolean; posicao: number | null } | null>(null);
  const [ignorarRascunho, setIgnorarRascunho] = useState(false);
  const [copiado, setCopiado] = useState(false);
  const [pending, startTransition] = useTransition();
  const topRef = useRef<HTMLDivElement>(null);

  const rascunhoSalvo = useSyncExternalStore(subscribeStorage, () => lerRascunho(slug), () => null);
  const rascunho = useMemo(() => {
    if (!rascunhoSalvo) return null;
    try {
      return JSON.parse(rascunhoSalvo) as Rascunho;
    } catch {
      return null;
    }
  }, [rascunhoSalvo]);
  const mostrarRascunho = Boolean(rascunho) && !ignorarRascunho && Object.keys(respostas).length === 0 && !concluida;

  const naRevisao = etapa === etapas.length;
  const atual = etapas[etapa];

  const subir = () => topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });

  const set = (id: string, valor: ValorResposta) => {
    setRespostas((anterior) => {
      const proximo = { ...anterior, [id]: valor };
      salvarRascunho(slug, { respostas: proximo, etapa, salvoEm: new Date().toISOString() });
      return proximo;
    });
    setErros((anterior) => {
      if (!anterior[id]) return anterior;
      const proximo = { ...anterior };
      delete proximo[id];
      return proximo;
    });
  };

  const irPara = (indice: number) => {
    if (Object.keys(respostas).length) salvarRascunho(slug, { respostas, etapa: indice, salvoEm: new Date().toISOString() });
    setEtapa(indice);
    setVisitadas((v) => Math.max(v, indice + 1));
    setErroGeral(null);
    subir();
  };

  const validarEtapa = (indice: number) => validarRespostas(etapas[indice].perguntas, respostas, regras, perguntas);
  const visivel = (p: PerguntaPublica) => perguntaVisivel(p, perguntas, respostas);
  const visiveis = perguntas.filter(visivel);
  const numeroVisivel = new Map(visiveis.map((p, i) => [p.id, i + 1]));

  const continuar = () => {
    const resultado = validarEtapa(etapa);
    if (!resultado.ok) {
      setErros((anterior) => ({ ...anterior, ...resultado.erros }));
      setErroGeral("Confira os campos destacados antes de continuar.");
      const primeiro = etapas[etapa].perguntas.find((p) => resultado.erros[p.id]);
      if (primeiro) document.querySelector<HTMLElement>(`[data-pergunta="${primeiro.id}"]`)?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    irPara(etapa + 1);
  };

  const enviar = () => {
    const resultado = validarRespostas(perguntas, respostas, regras);
    if (!resultado.ok) {
      setErros(resultado.erros);
      const primeira = etapas.findIndex((e) => e.perguntas.some((p) => resultado.erros[p.id]));
      irPara(Math.max(0, primeira));
      setErroGeral("Ainda falta responder algumas perguntas.");
      return;
    }
    startTransition(async () => {
      const result = await inscrever(slug, respostas);
      if (!result.ok) {
        if (result.fieldErrors) {
          setErros(result.fieldErrors);
          const primeira = etapas.findIndex((e) => e.perguntas.some((p) => result.fieldErrors![p.id]));
          if (primeira >= 0) irPara(primeira);
        }
        setErroGeral(result.error);
        subir();
        return;
      }
      salvarRascunho(slug, null);
      setConcluida({ protocolo: result.protocolo, nome: result.nome, listaEspera: result.listaEspera, posicao: result.posicao });
      subir();
    });
  };

  /* ---------- tela de sucesso ---------- */

  if (concluida?.listaEspera) {
    const primeiroNome = concluida.nome?.split(" ")[0];
    return (
      <div ref={topRef} className={styles.success} role="status">
        <div className={styles.successHeader}>
          <span className={`${styles.successIcon} ${styles.successIconWait}`} aria-hidden="true">
            <Icon name="hands" size={32} />
          </span>
          <div>
            <h2>Você está na lista de espera{primeiroNome ? `, ${primeiroNome}` : ""}!</h2>
            <p>As vagas desta edição foram preenchidas, mas sua inscrição ficou guardada na fila. Não é preciso pagar nada agora.</p>
          </div>
        </div>

        <div className={`${styles.protocol} ${styles.protocolWait}`}>
          <span>Sua posição na fila</span>
          <strong>{concluida.posicao ? `${concluida.posicao}º` : "—"}</strong>
          <span className={styles.protocolSmall}>Protocolo {concluida.protocolo}</span>
        </div>

        <ol className={styles.nextSteps}>
          <li>
            <strong>Aguarde nosso contato</strong>
            <span>Se alguém desistir, a secretaria chama as pessoas da lista seguindo a ordem da fila, pelo WhatsApp ou e-mail.</span>
          </li>
          <li>
            <strong>Vaga liberada? Aí sim, o pagamento</strong>
            <span>Quando a sua vez chegar, você recebe as instruções de pagamento da pré-inscrição e o prazo.</span>
          </li>
          <li>
            <strong>Enquanto isso, ore com a gente</strong>
            <span>A missão acontece também por meio de quem intercede. Acompanhe as novidades no nosso Instagram.</span>
          </li>
        </ol>
      </div>
    );
  }

  if (concluida) {
    const primeiroNome = concluida.nome?.split(" ")[0];
    const prazo = pos.prazoDias ? somarDiasUteis(new Date(), pos.prazoDias) : null;
    const prazoTexto = prazo?.toLocaleDateString("pt-BR", { weekday: "long", day: "2-digit", month: "long" });
    const mensagem = `Olá! Fiz minha inscrição em "${pos.eventoNome}"${concluida.nome ? ` (${concluida.nome})` : ""}. Protocolo ${concluida.protocolo}. Segue o comprovante da pré-inscrição.`;
    const zap = pos.whatsapp ? linkWhatsApp(pos.whatsapp.telefone, mensagem) : null;

    return (
      <div ref={topRef} className={styles.success} role="status">
        <div className={styles.successHeader}>
          <span className={styles.successIcon} aria-hidden="true">
            <Icon name="growth" size={34} />
          </span>
          <div>
            <h2>Inscrição recebida{primeiroNome ? `, ${primeiroNome}` : ""}!</h2>
            <p>Que alegria ter você caminhando com a gente. Agora faltam poucos passos para garantir sua vaga.</p>
          </div>
        </div>

        <div className={styles.protocol}>
          <span>Seu protocolo</span>
          <strong>{concluida.protocolo}</strong>
          <button
            type="button"
            className={styles.copy}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(concluida.protocolo);
                setCopiado(true);
                setTimeout(() => setCopiado(false), 2500);
              } catch {
                setCopiado(false);
              }
            }}
          >
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>

        <ol className={styles.nextSteps}>
          {pos.valorPre && (
            <li>
              <strong>Pague a pré-inscrição de {pos.valorPre}</strong>
              <span>{prazoTexto ? `Até ${prazoTexto}. Depois disso a inscrição pode ser cancelada.` : "Use os dados de pagamento abaixo."}</span>
            </li>
          )}
          <li>
            <strong>Envie o comprovante para a secretaria</strong>
            <span>Informe seu protocolo para agilizar a confirmação.</span>
            {zap && (
              <a className={`button button-dark ${styles.zap}`} href={zap} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" /> Enviar pelo WhatsApp
              </a>
            )}
          </li>
          <li>
            <strong>Reunião de entrevista</strong>
            <span>Em breve a coordenação vai entrar em contato para agendar uma conversa rápida com você, para nos conhecermos melhor.</span>
          </li>
          <li>
            <strong>Aguarde a confirmação</strong>
            <span>Depois do pagamento e da entrevista, você recebe um e-mail confirmando sua vaga e entra no grupo da missão.</span>
          </li>
        </ol>

        {detalhes}
      </div>
    );
  }

  /* ---------- campos ---------- */

  const renderPergunta = (pergunta: PerguntaPublica) => {
    const id = `p-${pergunta.id}`;
    const erro = erros[pergunta.id];
    const valor = respostas[pergunta.id];
    const texto = typeof valor === "string" ? valor : "";
    const descr = [pergunta.ajuda ? `${id}-ajuda` : null, erro ? `${id}-erro` : null].filter(Boolean).join(" ") || undefined;
    const common = {
      id,
      "aria-invalid": Boolean(erro),
      "aria-describedby": descr,
      "aria-required": pergunta.obrigatoria,
      className: `${styles.input} ${erro ? styles.invalid : ""}`,
    };
    const isChoice = pergunta.tipo === "ESCOLHA_UNICA" || pergunta.tipo === "MULTIPLA_ESCOLHA";
    const Label = isChoice ? "legend" : "label";

    let campo: React.ReactNode;
    switch (pergunta.tipo) {
      case "PARAGRAFO":
        campo = <textarea {...common} rows={4} value={texto} onChange={(e) => set(pergunta.id, e.target.value)} maxLength={3000} />;
        break;
      case "EMAIL":
        campo = <input {...common} type="email" autoComplete="email" inputMode="email" value={texto} onChange={(e) => set(pergunta.id, e.target.value)} placeholder="nome@email.com" />;
        break;
      case "TELEFONE":
        campo = <input {...common} type="tel" autoComplete="tel" inputMode="tel" value={texto} onChange={(e) => set(pergunta.id, formatTelefone(e.target.value))} placeholder="(00) 00000-0000" />;
        break;
      case "CPF":
        campo = <input {...common} inputMode="numeric" value={texto} onChange={(e) => set(pergunta.id, formatCpf(e.target.value))} placeholder="000.000.000-00" />;
        break;
      case "DATA":
        campo = <input {...common} type="date" value={texto} max={new Date().toISOString().slice(0, 10)} onChange={(e) => set(pergunta.id, e.target.value)} />;
        break;
      case "ESCOLHA_UNICA":
      case "MULTIPLA_ESCOLHA": {
        const multipla = pergunta.tipo === "MULTIPLA_ESCOLHA";
        const marcadas = Array.isArray(valor) ? valor : [];
        campo = (
          <div className={styles.options}>
            {pergunta.opcoes.map((opcao) => {
              const checked = multipla ? marcadas.includes(opcao) : texto === opcao;
              return (
                <label key={opcao} className={`${styles.option} ${checked ? styles.optionChecked : ""}`}>
                  <input
                    type={multipla ? "checkbox" : "radio"}
                    name={id}
                    value={opcao}
                    checked={checked}
                    onChange={() => set(pergunta.id, multipla ? (checked ? marcadas.filter((m) => m !== opcao) : [...marcadas, opcao]) : opcao)}
                  />
                  <span className={multipla ? styles.check : styles.radio} aria-hidden="true" />
                  {opcao}
                </label>
              );
            })}
          </div>
        );
        break;
      }
      default:
        campo = (
          <input
            {...common}
            autoComplete={/nome completo/i.test(pergunta.label) ? "name" : undefined}
            value={texto}
            onChange={(e) => set(pergunta.id, e.target.value)}
            maxLength={300}
          />
        );
    }

    const conteudo = (
      <>
        <Label className={styles.label} {...(!isChoice ? { htmlFor: id } : {})}>
          <span className={styles.number} aria-hidden="true">
            {String(numeroVisivel.get(pergunta.id) ?? numero.get(pergunta.id)).padStart(2, "0")}
          </span>
          <span>
            {pergunta.label}
            {pergunta.obrigatoria ? <span className={styles.req}> *</span> : <span className={styles.optional}> (opcional)</span>}
          </span>
        </Label>
        {pergunta.ajuda && (
          <p id={`${id}-ajuda`} className={styles.help}>
            {pergunta.ajuda}
          </p>
        )}
        {campo}
        {erro && (
          <p id={`${id}-erro`} className={styles.error}>
            {erro}
          </p>
        )}
      </>
    );

    const className = `${styles.question} ${erro ? styles.questionError : ""}`;
    return isChoice ? (
      <fieldset key={pergunta.id} className={className} data-pergunta={pergunta.id} aria-describedby={descr}>
        {conteudo}
      </fieldset>
    ) : (
      <div key={pergunta.id} className={className} data-pergunta={pergunta.id}>
        {conteudo}
      </div>
    );
  };

  /* ---------- formulário em etapas ---------- */

  const progresso = Math.round(((etapa + 1) / totalEtapas) * 100);
  const perguntasEtapa = atual ? atual.perguntas.filter(visivel) : [];
  const respondidasEtapa = perguntasEtapa.filter((p) => respondida(respostas[p.id])).length;

  return (
    <div ref={topRef} className={styles.wizard}>
      {mostrarRascunho && rascunho && (
        <div className={styles.draft}>
          <Icon name="give" size={20} />
          <p>
            Você começou esta inscrição em{" "}
            {new Date(rascunho.salvoEm).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}. Quer
            continuar de onde parou?
          </p>
          <div className={styles.draftActions}>
            <button
              type="button"
              className="button button-dark"
              onClick={() => {
                const validas = Object.fromEntries(Object.entries(rascunho.respostas).filter(([id]) => numero.has(id)));
                setRespostas(validas);
                const destino = Math.min(rascunho.etapa, etapas.length);
                setEtapa(destino);
                setVisitadas(destino + 1);
              }}
            >
              Continuar
            </button>
            <button
              type="button"
              className={styles.linkButton}
              onClick={() => {
                salvarRascunho(slug, null);
                setIgnorarRascunho(true);
              }}
            >
              Começar do zero
            </button>
          </div>
        </div>
      )}

      <nav className={styles.progress} aria-label="Etapas da inscrição">
        <div className={styles.progressTop}>
          <span>
            Etapa {etapa + 1} de {totalEtapas}
          </span>
          <strong>{naRevisao ? "Revisão" : atual.titulo}</strong>
        </div>
        <div className={styles.bar} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progresso} aria-label="Progresso da inscrição">
          <span style={{ width: `${progresso}%` }} />
        </div>
        <ol className={styles.chips}>
          {[...etapas.map((e) => e.titulo), "Revisão"].map((titulo, i) => {
            const temErro = i < etapas.length && etapas[i].perguntas.some((p) => erros[p.id]);
            const liberada = i < visitadas;
            return (
              <li key={titulo + i}>
                <button
                  type="button"
                  className={[styles.chip, i === etapa && styles.chipActive, i < etapa && !temErro && styles.chipDone, temErro && styles.chipError].filter(Boolean).join(" ")}
                  onClick={() => liberada && irPara(i)}
                  disabled={!liberada}
                  aria-current={i === etapa ? "step" : undefined}
                >
                  <span aria-hidden="true">{temErro ? "!" : i < etapa ? "✓" : i + 1}</span>
                  {titulo}
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {erroGeral && (
        <div className={styles.alert} role="alert">
          {erroGeral}
        </div>
      )}

      {naRevisao ? (
        <section className={styles.review} aria-labelledby="revisao-titulo">
          <h3 id="revisao-titulo">Confira suas respostas</h3>
          <p className={styles.reviewIntro}>Se algo estiver errado, clique em &quot;Editar&quot; para voltar à etapa.</p>
          {etapas.map((e, i) => (
            <div key={e.titulo + i} className={styles.reviewGroup}>
              <div className={styles.reviewHeader}>
                <h4>{e.titulo}</h4>
                <button type="button" className={styles.linkButton} onClick={() => irPara(i)}>
                  Editar
                </button>
              </div>
              <dl>
                {e.perguntas.filter(visivel).map((p) => (
                  <div key={p.id}>
                    <dt>{p.label}</dt>
                    <dd>{formatarResposta(p, respostas[p.id])}</dd>
                  </div>
                ))}
              </dl>
            </div>
          ))}
          <p className={styles.terms}>Ao enviar, você confirma que as informações são verdadeiras e que está de acordo com as regras do projeto.</p>
        </section>
      ) : (
        <form
          className={styles.form}
          onSubmit={(event) => {
            event.preventDefault();
            continuar();
          }}
          noValidate
        >
          <p className={styles.legend}>
            {respondidasEtapa} de {perguntasEtapa.length} respondidas · <span className={styles.req}>*</span> obrigatória
          </p>
          {perguntasEtapa.map(renderPergunta)}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      )}

      <div className={styles.nav}>
        <button type="button" className="button button-outline" onClick={() => irPara(etapa - 1)} disabled={etapa === 0 || pending}>
          Voltar
        </button>
        <div className={styles.navInfo} aria-live="polite">
          <span>
            Etapa {etapa + 1} de {totalEtapas}
          </span>
          <div className={styles.miniBar} aria-hidden="true">
            <i style={{ width: `${progresso}%` }} />
          </div>
          <small>{naRevisao ? "Último passo: enviar" : `Próxima: ${etapas[etapa + 1]?.titulo ?? "Revisão"}`}</small>
        </div>
        {naRevisao ? (
          <button type="button" className="button button-primary" onClick={enviar} disabled={pending}>
            {pending ? "Enviando..." : listaEspera ? "Entrar na lista de espera" : "Enviar inscrição"} {!pending && <Icon name="arrow" />}
          </button>
        ) : (
          <button type="button" className="button button-dark" onClick={continuar}>
            {etapa === etapas.length - 1 ? "Revisar respostas" : "Continuar"} <Icon name="arrow" />
          </button>
        )}
      </div>
      <p className={styles.saved}>
        <Icon name="growth" size={16} /> Suas respostas ficam salvas neste aparelho até você enviar.
      </p>
    </div>
  );
}
