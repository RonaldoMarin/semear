"use client";

import { useState, useTransition } from "react";
import { removerEntrevista, salvarEntrevista } from "@/app/admin/actions/inscricoes";
import { AdminIcon } from "../AdminIcon";
import { linkWhatsApp } from "@/lib/whatsapp";
import { avisar } from "../Avisos";
import styles from "./inscricoes.module.css";

interface Props {
  refDialog: React.RefObject<HTMLDialogElement | null>;
  inscricao: {
    id: string;
    nome: string;
    telefone: string | null;
    eventoNome: string;
    /** "2026-11-12T19:00" (horário de Recife) ou "" */
    entrevistaLocal: string;
    entrevistaLink: string | null;
  };
}

const LINK_VALIDO = /^https:\/\/\S+$/;
const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function quandoPorExtenso(quando: string) {
  const data = new Date(`${quando}:00-03:00`);
  const dia = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", weekday: "long", day: "2-digit", month: "2-digit" }).format(data);
  const hora = new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Recife", hour: "2-digit", minute: "2-digit" }).format(data).replace(":", "h");
  return `${dia}, às ${hora}`;
}

function mensagemPadrao(nome: string, eventoNome: string, quando: string, link: string) {
  const primeiroNome = nome.trim().split(/\s+/)[0];
  return [
    `Olá, ${primeiroNome}! Tudo bem? Aqui é da secretaria da Missão Semear no Sertão 🌵`,
    "",
    `Recebemos sua inscrição em *${eventoNome}* e queremos marcar uma conversa rápida com você pelo Google Meet, para nos conhecermos melhor e tirar suas dúvidas.`,
    "",
    `📅 ${DATA_VALIDA.test(quando) ? quandoPorExtenso(quando) : "[data e horário]"}`,
    `🔗 ${link || "[link do Meet]"}`,
    "",
    "Se esse horário não der certo pra você, é só responder aqui que a gente remarca. Até lá!",
  ].join("\n");
}

/** Marca a entrevista (data + link do Meet) e abre o WhatsApp com o convite pronto. */
export function EntrevistaDialog({ refDialog, inscricao }: Props) {
  const [quando, setQuando] = useState(inscricao.entrevistaLocal);
  const [link, setLink] = useState(inscricao.entrevistaLink ?? "");
  const [textoEditado, setTextoEditado] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const mensagem = textoEditado ?? mensagemPadrao(inscricao.nome, inscricao.eventoNome, quando, link.trim());
  const pronto = DATA_VALIDA.test(quando) && LINK_VALIDO.test(link.trim()) && Boolean(inscricao.telefone);
  const jaMarcada = Boolean(inscricao.entrevistaLink);

  const salvar = () =>
    startTransition(async () => {
      const r = await salvarEntrevista(inscricao.id, { quando, link: link.trim() });
      if (r.ok) {
        avisar({ tipo: "ok", texto: `Entrevista de ${inscricao.nome.split(" ")[0]} salva. Confira o envio no WhatsApp.` });
        refDialog.current?.close();
      } else {
        avisar({ tipo: "erro", texto: r.error });
      }
    });

  return (
    <dialog
      ref={refDialog}
      className={styles.compose}
      aria-labelledby={`entrevista-${inscricao.id}`}
      onClick={(e) => e.target === refDialog.current && refDialog.current?.close()}
    >
      <div className={styles.composeInner}>
        <header className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerKicker}>Reunião de entrevista</span>
            <h2 id={`entrevista-${inscricao.id}`}>{jaMarcada ? "Remarcar entrevista" : "Agendar entrevista"}</h2>
            <p>
              Com <strong>{inscricao.nome}</strong>
              {inscricao.telefone ? ` · ${inscricao.telefone}` : ""}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={() => refDialog.current?.close()} aria-label="Fechar">
            <AdminIcon name="close" />
          </button>
        </header>

        {!inscricao.telefone && <div className={styles.composeError}>Esta inscrição não tem telefone para enviar pelo WhatsApp.</div>}

        <div className={styles.entrevistaGrid}>
          <label className={styles.composeField}>
            <span>Data e horário</span>
            <input type="datetime-local" value={quando} onChange={(e) => setQuando(e.target.value)} required />
          </label>
          <label className={styles.composeField}>
            <span>Link do Google Meet</span>
            <input type="url" inputMode="url" value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://meet.google.com/abc-defg-hij" required />
          </label>
        </div>
        <p className={styles.composeHint}>
          Ainda não tem o link?{" "}
          <a href="https://meet.google.com/new" target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
            Criar reunião no Meet ↗
          </a>{" "}
          — abre numa nova aba; copie o link da reunião e cole aqui.
        </p>

        <label className={styles.composeField}>
          <span>
            Mensagem{" "}
            {textoEditado !== null && (
              <button type="button" className={styles.inlineLink} onClick={() => setTextoEditado(null)}>
                (voltar ao texto padrão)
              </button>
            )}
          </span>
          <textarea rows={9} value={mensagem} onChange={(e) => setTextoEditado(e.target.value)} />
        </label>

        <div className={styles.composeFooter}>
          {jaMarcada && (
            <button
              type="button"
              className={`${styles.inlineLink} ${styles.footerLeft}`}
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  await removerEntrevista(inscricao.id);
                  avisar({ tipo: "ok", texto: "Entrevista desmarcada." });
                  refDialog.current?.close();
                })
              }
            >
              Desmarcar entrevista
            </button>
          )}
          <button
            type="button"
            className="button button-outline"
            disabled={!pronto || pending}
            onClick={() => {
              void navigator.clipboard?.writeText(mensagem);
              avisar({ tipo: "ok", texto: "Mensagem copiada." });
            }}
          >
            Copiar mensagem
          </button>
          {pronto ? (
            // o link abre o WhatsApp na hora (sem bloqueio de pop-up) e a entrevista é salva em paralelo
            <a className="button button-dark" href={linkWhatsApp(inscricao.telefone!, mensagem)} target="_blank" rel="noopener noreferrer" onClick={salvar}>
              <AdminIcon name="phone" size={18} /> Salvar e abrir WhatsApp
            </a>
          ) : (
            <button type="button" className="button button-dark" disabled>
              <AdminIcon name="phone" size={18} /> Salvar e abrir WhatsApp
            </button>
          )}
        </div>
      </div>
    </dialog>
  );
}
