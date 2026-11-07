"use client";

/* eslint-disable @next/next/no-img-element */
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import { finalizarPedido } from "@/app/(site)/loja/actions";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/eventos/format";
import { formatarNome } from "@/lib/inscricoes/validacao";
import { carrinhoStore, quantidadeCarrinho, totalCarrinho, type ItemCarrinho } from "@/lib/loja/carrinho";
import styles from "./Carrinho.module.css";

const CHAVE_NOME = "semear.carrinho.nome";

interface CarrinhoContexto {
  itens: ItemCarrinho[];
  quantidade: number;
  adicionar: (item: ItemCarrinho) => void;
  abrir: () => void;
}

const Contexto = createContext<CarrinhoContexto | null>(null);

export function useCarrinho() {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error("useCarrinho precisa do <CarrinhoProvider>");
  return ctx;
}

const imagemUrl = (id: string) => `/loja/imagens/${id}`;

export function CarrinhoProvider({ children }: { children: React.ReactNode }) {
  const itens = useSyncExternalStore(carrinhoStore.subscribe, carrinhoStore.getSnapshot, carrinhoStore.getServerSnapshot);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [nome, setNome] = useState("");
  const [observacao, setObservacao] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [enviado, setEnviado] = useState<string | null>(null);
  const [pronto, setPronto] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const abrir = useCallback(() => {
    setEnviado(null);
    setNome((atual) => {
      if (atual) return atual;
      try {
        return localStorage.getItem(CHAVE_NOME) ?? "";
      } catch {
        return "";
      }
    });
    dialogRef.current?.showModal();
  }, []);

  const fechar = () => dialogRef.current?.close();

  const adicionar = useCallback((item: ItemCarrinho) => {
    const atuais = carrinhoStore.getSnapshot();
    const existente = atuais.find((i) => i.varianteId === item.varianteId);
    carrinhoStore.set(
      existente
        ? atuais.map((i) => (i.varianteId === item.varianteId ? { ...item, quantidade: Math.min(item.estoque, i.quantidade + item.quantidade) } : i))
        : [...atuais, item],
    );
    setPronto(null);
    setErro(null);
  }, []);

  const mudarQuantidade = (varianteId: string, quantidade: number) => {
    setPronto(null);
    carrinhoStore.set(
      quantidade <= 0
        ? itens.filter((i) => i.varianteId !== varianteId)
        : itens.map((i) => (i.varianteId === varianteId ? { ...i, quantidade: Math.min(quantidade, i.estoque) } : i)),
    );
  };

  // fecha clicando fora do painel
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onClick = (e: MouseEvent) => e.target === dialog && dialog.close();
    dialog.addEventListener("click", onClick);
    return () => dialog.removeEventListener("click", onClick);
  }, []);

  const conferir = () => {
    setErro(null);
    startTransition(async () => {
      const r = await finalizarPedido({
        nome,
        observacao,
        itens: itens.map((i) => ({ varianteId: i.varianteId, quantidade: i.quantidade, precoCentavos: i.precoCentavos })),
      });
      if (r.itens) carrinhoStore.set(r.itens);
      if (!r.ok) {
        setErro(r.error);
        return;
      }
      try {
        localStorage.setItem(CHAVE_NOME, formatarNome(nome));
      } catch {
        // sem armazenamento: tudo bem
      }
      setPronto(r.url);
    });
  };

  const enviar = () => {
    // o link abre o WhatsApp numa nova aba; o carrinho é esvaziado aqui
    setEnviado(formatarNome(nome).split(" ")[0] ?? "");
    setPronto(null);
    setObservacao("");
    carrinhoStore.set([]);
  };

  const quantidade = quantidadeCarrinho(itens);
  const total = totalCarrinho(itens);
  const valor = useMemo(() => ({ itens, quantidade, adicionar, abrir }), [itens, quantidade, adicionar, abrir]);

  return (
    <Contexto.Provider value={valor}>
      {children}

      <dialog ref={dialogRef} className={styles.drawer} aria-labelledby="carrinho-titulo" onClose={() => setErro(null)}>
        <div className={styles.painel}>
          <header className={styles.topo}>
            <h2 id="carrinho-titulo">
              Seu carrinho {quantidade > 0 && <span>{quantidade}</span>}
            </h2>
            <button type="button" className={styles.fechar} onClick={fechar} aria-label="Fechar carrinho">
              <span aria-hidden="true">×</span>
            </button>
          </header>

          {enviado !== null ? (
            <div className={styles.vazio}>
              <span className={styles.vazioIcone}>
                <Icon name="whatsapp" size={30} />
              </span>
              <h3>Pedido enviado{enviado ? `, ${enviado}` : ""}!</h3>
              <p>Agora é só enviar a mensagem que abriu no WhatsApp. A equipe do Semear combina com você o pagamento e a entrega.</p>
              <button type="button" className="button button-outline" onClick={fechar}>
                Continuar vendo a loja
              </button>
            </div>
          ) : itens.length === 0 ? (
            <div className={styles.vazio}>
              <span className={styles.vazioIcone}>
                <Icon name="bag" size={30} />
              </span>
              <h3>Seu carrinho está vazio</h3>
              <p>Escolha uma camiseta ou outro item da lojinha. Toda renda ajuda a missão.</p>
              <Link href="/loja" className="button button-primary" onClick={fechar}>
                Ver a loja
              </Link>
            </div>
          ) : (
            <>
              <ul className={styles.itens}>
                {itens.map((item) => (
                  <li key={item.varianteId} className={styles.item}>
                    <Link href={`/loja/${item.slug}`} className={styles.thumb} onClick={fechar} tabIndex={-1}>
                      {item.imagemId ? <img src={imagemUrl(item.imagemId)} alt="" /> : <Icon name="bag" size={22} />}
                    </Link>
                    <div className={styles.itemInfo}>
                      <Link href={`/loja/${item.slug}`} onClick={fechar}>
                        {item.nome}
                      </Link>
                      <small>
                        {item.tamanho && <>Tam. <b>{item.tamanho}</b> · </>}
                        {formatMoney(item.precoCentavos)}
                      </small>
                      <div className={styles.qtd}>
                        <button type="button" onClick={() => mudarQuantidade(item.varianteId, item.quantidade - 1)} aria-label={`Diminuir ${item.nome}`}>
                          −
                        </button>
                        <span aria-live="polite">{item.quantidade}</span>
                        <button
                          type="button"
                          onClick={() => mudarQuantidade(item.varianteId, item.quantidade + 1)}
                          disabled={item.quantidade >= item.estoque}
                          aria-label={`Aumentar ${item.nome}`}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className={styles.itemFim}>
                      <strong>{formatMoney(item.precoCentavos * item.quantidade)}</strong>
                      <button type="button" className={styles.remover} onClick={() => mudarQuantidade(item.varianteId, 0)}>
                        Remover
                      </button>
                    </div>
                  </li>
                ))}
              </ul>

              <footer className={styles.rodape}>
                <div className={styles.total}>
                  <span>Total</span>
                  <strong>{formatMoney(total)}</strong>
                </div>

                {pronto ? (
                  <div className={styles.pronto}>
                    <p>
                      Tudo certo! Toque abaixo para abrir o WhatsApp com o pedido já escrito. O pagamento é combinado por lá.
                    </p>
                    <a href={pronto} target="_blank" rel="noopener noreferrer" className={`button ${styles.whats}`} onClick={enviar}>
                      <Icon name="whatsapp" size={20} /> Enviar pedido no WhatsApp
                    </a>
                    <button type="button" className={styles.voltar} onClick={() => setPronto(null)}>
                      Voltar e editar
                    </button>
                  </div>
                ) : (
                  <form
                    className={styles.form}
                    onSubmit={(e) => {
                      e.preventDefault();
                      conferir();
                    }}
                  >
                    <label>
                      <span>Seu nome</span>
                      <input value={nome} onChange={(e) => setNome(e.target.value)} required minLength={3} maxLength={80} autoComplete="name" placeholder="Nome e sobrenome" />
                    </label>
                    <label>
                      <span>
                        Observação <em>(opcional)</em>
                      </span>
                      <textarea value={observacao} onChange={(e) => setObservacao(e.target.value)} rows={2} maxLength={400} placeholder="Ex.: retiro no próximo culto" />
                    </label>
                    {erro && (
                      <p className={styles.erro} role="alert">
                        {erro}
                      </p>
                    )}
                    <button type="submit" className={`button button-dark ${styles.finalizar}`} disabled={pending}>
                      {pending ? "Conferindo estoque..." : "Finalizar pedido"}
                    </button>
                    <p className={styles.nota}>O pedido vai pelo WhatsApp do Semear. Nada é cobrado aqui no site.</p>
                  </form>
                )}
              </footer>
            </>
          )}
        </div>
      </dialog>
    </Contexto.Provider>
  );
}

/** Botão do carrinho no cabeçalho do site. */
export function CarrinhoBotao({ className }: { className?: string }) {
  const { quantidade, abrir } = useCarrinho();
  return (
    <button type="button" className={`${styles.botao} ${className ?? ""}`} onClick={abrir} aria-label={`Abrir carrinho (${quantidade} ${quantidade === 1 ? "item" : "itens"})`}>
      <Icon name="bag" size={22} />
      {quantidade > 0 && <span className={styles.badge}>{quantidade > 99 ? "99+" : quantidade}</span>}
    </button>
  );
}
