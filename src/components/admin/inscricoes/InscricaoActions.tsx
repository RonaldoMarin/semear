"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { enviarMensagemInscrito } from "@/app/admin/actions/inscricoes";
import type { StatusInscricao } from "@prisma/client";
import { AdminIcon } from "../AdminIcon";
import { linkWhatsApp } from "@/lib/whatsapp";
import { EntrevistaDialog } from "./EntrevistaDialog";
import { StatusSelect } from "./StatusSelect";
import styles from "./inscricoes.module.css";

export interface InscricaoResumo {
  id: string;
  protocolo: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  cpf: string | null;
  status: StatusInscricao;
  criadoEm: string;
  eventoNome: string;
  respostas: { label: string; valor: string }[];
  /** entrevista marcada: "2026-11-12T19:00" (para o formulário) e texto já formatado */
  entrevistaLocal: string;
  entrevistaTexto: string | null;
  entrevistaLink: string | null;
}

function whatsapp(telefone: string, nome: string, eventoNome: string) {
  return linkWhatsApp(telefone, `Olá, ${nome.split(" ")[0]}! Aqui é da secretaria da ${eventoNome} 🌵`);
}

/** Menu "⋯" da linha + painel lateral com todas as respostas. */
export function InscricaoActions({ inscricao, podeGerenciar }: { inscricao: InscricaoResumo; podeGerenciar: boolean }) {
  // posição do menu na tela (fixed): a tabela tem rolagem própria e cortaria um menu absoluto
  const [posicao, setPosicao] = useState<{ top: number; right: number } | null>(null);
  const aberto = posicao !== null;
  const setAberto = (abrir: boolean) => {
    if (!abrir) return setPosicao(null);
    const rect = menuRef.current?.getBoundingClientRect();
    if (!rect) return;
    const alturaMenu = 200;
    const top = rect.bottom + alturaMenu > window.innerHeight ? rect.top - alturaMenu - 6 : rect.bottom + 6;
    setPosicao({ top: Math.max(8, top), right: Math.max(8, window.innerWidth - rect.right) });
  };
  const menuRef = useRef<HTMLDivElement>(null);
  const drawerRef = useRef<HTMLDialogElement>(null);
  const composeRef = useRef<HTMLDialogElement>(null);
  const entrevistaRef = useRef<HTMLDialogElement>(null);

  // fecha o menu ao clicar fora ou apertar Esc
  useEffect(() => {
    if (!aberto) return;
    const fechar = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === "Escape" : !menuRef.current?.contains(event.target as Node)) setAberto(false);
    };
    const fecharNaRolagem = () => setPosicao(null);
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", fechar);
    window.addEventListener("scroll", fecharNaRolagem, true);
    window.addEventListener("resize", fecharNaRolagem);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", fechar);
      window.removeEventListener("scroll", fecharNaRolagem, true);
      window.removeEventListener("resize", fecharNaRolagem);
    };
  }, [aberto]);

  const verRespostas = () => {
    setAberto(false);
    drawerRef.current?.showModal();
  };

  return (
    <div className={styles.menuWrap} ref={menuRef}>
      <button
        type="button"
        className={styles.kebab}
        aria-haspopup="menu"
        aria-expanded={aberto}
        aria-label={`Ações da inscrição de ${inscricao.nome}`}
        onClick={() => setAberto(!aberto)}
      >
        <span aria-hidden="true">⋯</span>
      </button>

      {aberto && (
        <div className={styles.menu} role="menu" style={{ top: posicao.top, right: posicao.right }}>
          <button type="button" role="menuitem" onClick={verRespostas}>
            <AdminIcon name="eye" size={17} /> Ver respostas
          </button>
          {podeGerenciar && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAberto(false);
                entrevistaRef.current?.showModal();
              }}
            >
              <AdminIcon name="calendar" size={17} /> {inscricao.entrevistaLink ? "Remarcar entrevista" : "Agendar entrevista"}
            </button>
          )}
          {inscricao.telefone && (
            <a role="menuitem" href={whatsapp(inscricao.telefone, inscricao.nome, inscricao.eventoNome)} target="_blank" rel="noopener noreferrer" onClick={() => setAberto(false)}>
              <AdminIcon name="phone" size={17} /> Conversar no WhatsApp
            </a>
          )}
          {inscricao.email && podeGerenciar && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                setAberto(false);
                composeRef.current?.showModal();
              }}
            >
              <AdminIcon name="external" size={17} /> Enviar e-mail
            </button>
          )}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              void navigator.clipboard?.writeText(inscricao.protocolo);
              setAberto(false);
            }}
          >
            <AdminIcon name="copy" size={17} /> Copiar protocolo
          </button>
        </div>
      )}

      <dialog ref={drawerRef} className={styles.drawer} aria-labelledby={`drawer-${inscricao.id}`} onClick={(event) => event.target === drawerRef.current && drawerRef.current?.close()}>
        <div className={styles.drawerInner}>
          <header className={styles.drawerHeader}>
            <div>
              <span className={styles.drawerKicker}>
                {inscricao.eventoNome} · #{inscricao.protocolo}
              </span>
              <h2 id={`drawer-${inscricao.id}`}>{inscricao.nome}</h2>
              <p>Inscrito em {inscricao.criadoEm}</p>
            </div>
            <button type="button" className={styles.close} onClick={() => drawerRef.current?.close()} aria-label="Fechar">
              <AdminIcon name="close" />
            </button>
          </header>

          <div className={styles.drawerStatus}>
            <span>Situação</span>
            <StatusSelect id={inscricao.id} status={inscricao.status} nome={inscricao.nome} email={inscricao.email} disabled={!podeGerenciar} />
          </div>

          {inscricao.entrevistaTexto && (
            <div className={styles.drawerEntrevista}>
              <AdminIcon name="calendar" size={20} />
              <div>
                <strong>Entrevista: {inscricao.entrevistaTexto}</strong>
                {inscricao.entrevistaLink && (
                  <a href={inscricao.entrevistaLink} target="_blank" rel="noopener noreferrer">
                    {inscricao.entrevistaLink.replace(/^https:\/\//, "")}
                  </a>
                )}
              </div>
            </div>
          )}

          <div className={styles.drawerContacts}>
            {inscricao.telefone && (
              <a className="button button-dark" href={whatsapp(inscricao.telefone, inscricao.nome, inscricao.eventoNome)} target="_blank" rel="noopener noreferrer">
                <AdminIcon name="phone" size={18} /> WhatsApp
              </a>
            )}
            {inscricao.email && podeGerenciar && (
              <button
                type="button"
                className="button button-outline"
                onClick={() => {
                  drawerRef.current?.close();
                  composeRef.current?.showModal();
                }}
              >
                Enviar e-mail
              </button>
            )}
          </div>

          <dl className={styles.drawerAnswers}>
            {inscricao.respostas.map((r, i) => (
              <div key={i}>
                <dt>{r.label}</dt>
                <dd>{r.valor}</dd>
              </div>
            ))}
          </dl>
        </div>
      </dialog>
      {podeGerenciar && <EntrevistaDialog refDialog={entrevistaRef} inscricao={inscricao} />}
      {inscricao.email && podeGerenciar && <ComposeDialog refDialog={composeRef} inscricao={inscricao} />}
    </div>
  );
}

/** Escrever e enviar um e-mail para o inscrito, pelo e-mail do projeto. */
function ComposeDialog({ refDialog, inscricao }: { refDialog: React.RefObject<HTMLDialogElement | null>; inscricao: InscricaoResumo }) {
  const [assunto, setAssunto] = useState(`Sobre sua inscrição · ${inscricao.eventoNome}`);
  const [mensagem, setMensagem] = useState("");
  const [resultado, setResultado] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pending, startTransition] = useTransition();

  const fechar = () => {
    refDialog.current?.close();
    if (resultado?.ok) {
      setMensagem("");
      setResultado(null);
    }
  };

  return (
    <dialog ref={refDialog} className={styles.compose} aria-labelledby={`compose-${inscricao.id}`} onClick={(e) => e.target === refDialog.current && fechar()}>
      <form
        className={styles.composeInner}
        onSubmit={(event) => {
          event.preventDefault();
          setResultado(null);
          startTransition(async () => {
            const r = await enviarMensagemInscrito(inscricao.id, { assunto, mensagem });
            setResultado(r.ok ? { ok: true, texto: `E-mail enviado para ${inscricao.email}.` } : { ok: false, texto: r.error });
          });
        }}
      >
        <header className={styles.drawerHeader}>
          <div>
            <span className={styles.drawerKicker}>Enviado por syssemear@gmail.com</span>
            <h2 id={`compose-${inscricao.id}`}>Enviar e-mail</h2>
            <p>
              Para <strong>{inscricao.nome}</strong> · {inscricao.email}
            </p>
          </div>
          <button type="button" className={styles.close} onClick={fechar} aria-label="Fechar">
            <AdminIcon name="close" />
          </button>
        </header>

        {resultado?.ok ? (
          <div className={styles.composeSent} role="status">
            <AdminIcon name="check" size={22} /> {resultado.texto}
          </div>
        ) : (
          <>
            {resultado && (
              <div className={styles.composeError} role="alert">
                {resultado.texto}
              </div>
            )}
            <label className={styles.composeField}>
              <span>Assunto</span>
              <input value={assunto} onChange={(e) => setAssunto(e.target.value)} maxLength={150} required />
            </label>
            <label className={styles.composeField}>
              <span>Mensagem</span>
              <textarea
                value={mensagem}
                onChange={(e) => setMensagem(e.target.value)}
                rows={8}
                maxLength={5000}
                required
                placeholder={`Escreva para ${inscricao.nome.split(" ")[0]}... A saudação e a assinatura com seu nome entram automaticamente.`}
              />
            </label>
            <p className={styles.composeHint}>O e-mail vai com o visual do projeto. As respostas chegam na caixa do Gmail da missão.</p>
          </>
        )}

        <div className={styles.composeFooter}>
          <button type="button" className="button button-outline" onClick={fechar}>
            {resultado?.ok ? "Fechar" : "Cancelar"}
          </button>
          {!resultado?.ok && (
            <button type="submit" className="button button-dark" disabled={pending || mensagem.trim().length < 5}>
              {pending ? "Enviando..." : "Enviar e-mail"}
            </button>
          )}
        </div>
      </form>
    </dialog>
  );
}
