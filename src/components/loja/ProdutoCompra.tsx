"use client";

import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/eventos/format";
import { useCarrinho } from "./Carrinho";
import styles from "./ProdutoCompra.module.css";

interface ProdutoCompraProps {
  id: string;
  slug: string;
  codigo: string;
  nome: string;
  precoCentavos: number;
  imagemId: string | null;
  variantes: { id: string; nome: string; estoque: number }[];
}

export function ProdutoCompra({ produto }: { produto: ProdutoCompraProps }) {
  const { itens, adicionar, abrir } = useCarrinho();
  const temTamanhos = produto.variantes.some((v) => v.nome);
  const disponiveis = produto.variantes.filter((v) => v.estoque > 0);
  const [varianteId, setVarianteId] = useState<string | null>(
    temTamanhos ? (disponiveis.length === 1 ? disponiveis[0].id : null) : (produto.variantes[0]?.id ?? null),
  );
  const [quantidade, setQuantidade] = useState(1);
  const [faltaTamanho, setFaltaTamanho] = useState(false);

  const variante = produto.variantes.find((v) => v.id === varianteId) ?? null;
  const noCarrinho = variante ? (itens.find((i) => i.varianteId === variante.id)?.quantidade ?? 0) : 0;
  const restante = variante ? Math.max(0, variante.estoque - noCarrinho) : 0;
  const esgotado = disponiveis.length === 0;

  const escolher = (id: string) => {
    setVarianteId(id);
    setQuantidade(1);
    setFaltaTamanho(false);
  };

  const adicionarAoCarrinho = () => {
    if (!variante) {
      setFaltaTamanho(true);
      return;
    }
    if (restante <= 0) return;
    adicionar({
      varianteId: variante.id,
      produtoId: produto.id,
      slug: produto.slug,
      codigo: produto.codigo,
      nome: produto.nome,
      tamanho: variante.nome,
      precoCentavos: produto.precoCentavos,
      imagemId: produto.imagemId,
      quantidade: Math.min(quantidade, restante),
      estoque: variante.estoque,
    });
    setQuantidade(1);
    abrir();
  };

  return (
    <div className={styles.compra}>
      <p className={styles.preco}>{formatMoney(produto.precoCentavos)}</p>

      {temTamanhos && (
        <fieldset className={`${styles.tamanhos} ${faltaTamanho ? styles.alerta : ""}`}>
          <legend>
            Tamanho {variante && <b>{variante.nome}</b>}
            {faltaTamanho && <span role="alert"> · escolha um tamanho</span>}
          </legend>
          <div>
            {produto.variantes.map((v) => (
              <button
                key={v.id}
                type="button"
                className={v.id === varianteId ? styles.tamanhoAtivo : undefined}
                onClick={() => escolher(v.id)}
                disabled={v.estoque === 0}
                aria-pressed={v.id === varianteId}
                title={v.estoque === 0 ? "Esgotado" : undefined}
              >
                {v.nome}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {esgotado ? (
        <p className={styles.esgotado}>Esgotado no momento. Fale com a gente pelo WhatsApp para saber da próxima leva.</p>
      ) : (
        <>
          <div className={styles.acoes}>
            <div className={styles.qtd} aria-label="Quantidade">
              <button type="button" onClick={() => setQuantidade((q) => Math.max(1, q - 1))} disabled={quantidade <= 1} aria-label="Diminuir quantidade">
                −
              </button>
              <span aria-live="polite">{quantidade}</span>
              <button
                type="button"
                onClick={() => setQuantidade((q) => q + 1)}
                disabled={Boolean(variante) && quantidade >= restante}
                aria-label="Aumentar quantidade"
              >
                +
              </button>
            </div>
            <button type="button" className={`button button-primary ${styles.adicionar}`} onClick={adicionarAoCarrinho} disabled={Boolean(variante) && restante <= 0}>
              <Icon name="bag" size={20} /> Adicionar ao carrinho
            </button>
          </div>
          {variante && (
            <p className={styles.estoque}>
              {restante <= 0
                ? "Você já colocou no carrinho todo o estoque deste item."
                : variante.estoque <= 5
                  ? `Últimas ${variante.estoque} unidades${noCarrinho ? ` (${noCarrinho} no seu carrinho)` : ""}`
                  : noCarrinho
                    ? `${noCarrinho} no seu carrinho`
                    : "Em estoque"}
            </p>
          )}
        </>
      )}
    </div>
  );
}
