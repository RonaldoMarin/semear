"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import type { StatusInscricao } from "@prisma/client";
import { alterarStatusInscricao } from "@/app/admin/actions/inscricoes";
import { statusInscricaoLabel } from "@/lib/inscricoes/labels";
import { AdminIcon } from "../AdminIcon";
import { avisar } from "../Avisos";
import { ehEmailDeTeste } from "@/lib/email-teste";
import styles from "./inscricoes.module.css";

const descricaoStatus: Record<StatusInscricao, string> = {
  PENDENTE: "Com vaga, aguardando pagamento",
  CONFIRMADA: "Pagamento conferido, vaga garantida",
  LISTA_ESPERA: "Sem vaga, aguardando na fila",
  CANCELADA: "Libera a vaga",
};

interface Acao {
  titulo: string;
  texto: string;
  botao: string;
  tom: "ok" | "cancel" | "wait";
  icone: "check" | "alert" | "users";
  /** texto do checkbox de e-mail (sem ele, a ação não avisa ninguém) */
  email?: string;
  emailDetalhe?: string;
}

/** Mudanças que pedem confirmação (e podem avisar a pessoa por e-mail). */
function acaoPara(de: StatusInscricao, para: StatusInscricao, nome: string): Acao | null {
  if (para === "CONFIRMADA")
    return {
      titulo: `Confirmar a inscrição de ${nome}?`,
      texto: "Use quando o pagamento da pré-inscrição já foi conferido. A vaga fica garantida.",
      botao: "Sim, confirmar",
      tom: "ok",
      icone: "check",
      email: "Enviar e-mail de confirmação",
      emailDetalhe: "com datas, locais e check-list.",
    };
  if (para === "CANCELADA")
    return {
      titulo: `Cancelar a inscrição de ${nome}?`,
      texto: "A vaga volta a ficar disponível para outras pessoas. Dá para reverter depois, se precisar.",
      botao: "Sim, cancelar inscrição",
      tom: "cancel",
      icone: "alert",
    };
  if (de === "LISTA_ESPERA" && para === "PENDENTE")
    return {
      titulo: `Liberar uma vaga para ${nome}?`,
      texto: "A pessoa sai da lista de espera e passa a ocupar uma vaga, aguardando o pagamento da pré-inscrição.",
      botao: "Sim, liberar vaga",
      tom: "wait",
      icone: "users",
      email: "Avisar que a vaga abriu",
      emailDetalhe: "com as instruções e o prazo de pagamento.",
    };
  return null;
}

export function StatusSelect({
  id,
  status,
  nome,
  email,
  disabled,
}: {
  id: string;
  status: StatusInscricao;
  nome: string;
  email?: string | null;
  disabled?: boolean;
}) {
  const emailTeste = ehEmailDeTeste(email);
  const podeEnviar = Boolean(email) && !emailTeste;
  const [atual, setAtual] = useState(status);
  // quando a situação muda no servidor (ex.: alterada no painel lateral), acompanha sem recriar o componente
  const [statusRecebido, setStatusRecebido] = useState(status);
  if (status !== statusRecebido) {
    setStatusRecebido(status);
    setAtual(status);
  }
  const [pendente, setPendente] = useState<StatusInscricao | null>(null);
  const [notificar, setNotificar] = useState(true);
  const [pending, startTransition] = useTransition();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const botaoRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);
  // menu em posição fixa na tela: a tabela tem rolagem própria e cortaria um menu absoluto
  const [menu, setMenu] = useState<{ top: number; left: number } | null>(null);

  const abrirMenu = () => {
    const rect = botaoRef.current?.getBoundingClientRect();
    if (!rect) return;
    const altura = 250;
    const largura = 260;
    const top = rect.bottom + altura + 8 > window.innerHeight ? rect.top - altura - 6 : rect.bottom + 6;
    const left = Math.min(rect.left, window.innerWidth - largura - 8);
    setMenu({ top: Math.max(8, top), left: Math.max(8, left) });
  };

  // foca a opção atual ao abrir; fecha ao clicar fora, apertar Esc ou rolar a página
  useEffect(() => {
    if (!menu) return;
    // preventScroll: rolar a página fecharia o menu logo ao abrir
    menuRef.current?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus({ preventScroll: true });
    const fechar = (event: Event) => {
      if (event instanceof KeyboardEvent) {
        if (event.key !== "Escape") return;
        botaoRef.current?.focus();
      } else if (event.type === "mousedown" && (menuRef.current?.contains(event.target as Node) || botaoRef.current?.contains(event.target as Node))) {
        return;
      }
      setMenu(null);
    };
    document.addEventListener("mousedown", fechar);
    document.addEventListener("keydown", fechar);
    window.addEventListener("scroll", fechar, true);
    window.addEventListener("resize", fechar);
    return () => {
      document.removeEventListener("mousedown", fechar);
      document.removeEventListener("keydown", fechar);
      window.removeEventListener("scroll", fechar, true);
      window.removeEventListener("resize", fechar);
    };
  }, [menu]);

  const aplicar = (novo: StatusInscricao, enviarEmail: boolean) => {
    const anterior = atual;
    setAtual(novo);
    startTransition(async () => {
      const result = await alterarStatusInscricao(id, novo, { notificar: enviarEmail });
      if (!result.ok) {
        setAtual(anterior);
        avisar({ tipo: "erro", texto: result.error });
        return;
      }
      if (enviarEmail && email) {
        const feito = novo === "CONFIRMADA" ? "Inscrição confirmada" : "Vaga liberada";
        avisar(
          result.emailEnviado
            ? { tipo: "ok", texto: `${feito} e e-mail enviado para ${email}.` }
            : { tipo: "erro", texto: `${feito}, mas o e-mail não pôde ser enviado.` },
        );
      } else {
        avisar({ tipo: "ok", texto: `Situação alterada para ${statusInscricaoLabel[novo].toLowerCase()}.` });
      }
    });
  };

  const escolher = (novo: StatusInscricao) => {
    if (novo === atual) return;
    if (acaoPara(atual, novo, nome)) {
      setPendente(novo);
      setNotificar(podeEnviar);
      dialogRef.current?.showModal();
      return;
    }
    aplicar(novo, false);
  };

  const fechar = () => {
    dialogRef.current?.close();
    setPendente(null);
  };

  const acao = pendente ? acaoPara(atual, pendente, nome) : null;

  return (
    <>
      <button
        ref={botaoRef}
        type="button"
        className={styles.statusSelect}
        data-status={atual}
        disabled={disabled || pending}
        aria-haspopup="listbox"
        aria-expanded={menu !== null}
        aria-label={`Situação da inscrição de ${nome}: ${statusInscricaoLabel[atual]}`}
        onClick={() => (menu ? setMenu(null) : abrirMenu())}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" && !menu) {
            event.preventDefault();
            abrirMenu();
          }
        }}
      >
        <span className={styles.statusDot} aria-hidden="true" />
        {statusInscricaoLabel[atual]}
        {!disabled && <AdminIcon name="chevronDown" size={15} className={styles.statusChevron} />}
      </button>

      {menu && (
        <ul
          ref={menuRef}
          className={styles.statusMenu}
          role="listbox"
          aria-label={`Escolher situação de ${nome}`}
          style={{ top: menu.top, left: menu.left }}
          onKeyDown={(event) => {
            const itens = [...(menuRef.current?.querySelectorAll<HTMLElement>('[role="option"]') ?? [])];
            const i = itens.indexOf(document.activeElement as HTMLElement);
            if (event.key === "ArrowDown") itens[(i + 1) % itens.length]?.focus();
            else if (event.key === "ArrowUp") itens[(i - 1 + itens.length) % itens.length]?.focus();
            else return;
            event.preventDefault();
          }}
        >
          {(Object.keys(statusInscricaoLabel) as StatusInscricao[]).map((s) => (
            <li key={s}>
              <button
                type="button"
                role="option"
                aria-selected={s === atual}
                className={styles.statusOption}
                data-status={s}
                onClick={() => {
                  setMenu(null);
                  escolher(s);
                }}
              >
                <span className={styles.statusDot} aria-hidden="true" />
                <span>
                  <strong>{statusInscricaoLabel[s]}</strong>
                  <small>{descricaoStatus[s]}</small>
                </span>
                {s === atual && <AdminIcon name="check" size={16} className={styles.statusCheck} />}
              </button>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={dialogRef} className={styles.confirm} onClose={() => setPendente(null)} aria-labelledby={`confirmar-${id}`}>
        {acao && (
          <>
            <div className={styles.confirmBody}>
              <span className={styles.confirmIcon} data-tipo={acao.tom} aria-hidden="true">
                <AdminIcon name={acao.icone} size={26} />
              </span>
              <h2 id={`confirmar-${id}`}>{acao.titulo}</h2>
              <p>{acao.texto}</p>
              {acao.email && (
                <label className={`${styles.notify} ${!podeEnviar ? styles.notifyOff : ""}`}>
                  <input type="checkbox" checked={notificar && podeEnviar} disabled={!podeEnviar} onChange={(e) => setNotificar(e.target.checked)} />
                  <span>
                    <strong>{acao.email}</strong>
                    <small>
                      {!email
                        ? "Esta inscrição não tem e-mail cadastrado."
                        : emailTeste
                          ? `${email} é um endereço de teste: nada será enviado.`
                          : `Para ${email}, ${acao.emailDetalhe}`}
                    </small>
                  </span>
                </label>
              )}
            </div>
            <div className={styles.confirmFooter}>
              <button type="button" className="button button-outline" onClick={fechar}>
                Voltar
              </button>
              <button
                type="button"
                className={`button ${acao.tom === "cancel" ? styles.buttonDanger : "button-primary"}`}
                onClick={() => {
                  if (pendente) aplicar(pendente, Boolean(acao.email) && notificar);
                  fechar();
                }}
              >
                {acao.botao}
              </button>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
