/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/eventos/format";
import { listarProdutosPublicos, urlImagem } from "@/lib/loja/produtos";
import styles from "./loja.module.css";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Loja",
  description: "Camisetas e produtos da missão Semear no Sertão. Toda renda ajuda a sustentar as viagens missionárias.",
};

export default async function LojaPage() {
  const produtos = await listarProdutosPublicos();

  return (
    <>
      <section className={styles.hero}>
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.kicker}>Lojinha da missão</p>
          <h1>Vista a missão</h1>
          <p className={styles.subtitle}>
            Camisetas e produtos do Semear no Sertão. Monte seu carrinho e finalize pelo WhatsApp: toda renda ajuda a levar a missão mais longe.
          </p>
        </div>
        <span className={styles.heroSeed} aria-hidden="true" />
      </section>

      <div className={`container ${styles.catalogo}`}>
        {produtos.length === 0 ? (
          <div className={styles.vazio}>
            <span className={styles.vazioIcone}>
              <Icon name="bag" size={32} />
            </span>
            <h2>A lojinha está sendo arrumada</h2>
            <p>Em breve os produtos da missão aparecem aqui. Enquanto isso, que tal conhecer o plano de mantenedores?</p>
            <Link href="/mantenedor" className="button button-primary">
              Seja mantenedor <Icon name="arrow" />
            </Link>
          </div>
        ) : (
          <ul className={styles.grade}>
            {produtos.map((produto) => {
              const estoque = produto.variantes.reduce((acc, v) => acc + v.estoque, 0);
              const tamanhos = produto.variantes.filter((v) => v.nome);
              const capa = produto.imagens[0];
              return (
                <li key={produto.id}>
                  <Link href={`/loja/${produto.slug}`} className={`${styles.card} ${estoque === 0 ? styles.esgotado : ""}`}>
                    <span className={styles.capa}>
                      {capa ? <img src={urlImagem(capa.id)} alt="" loading="lazy" /> : <Icon name="bag" size={40} />}
                      {produto.imagens[1] && <img src={urlImagem(produto.imagens[1].id)} alt="" loading="lazy" className={styles.capaHover} />}
                      {estoque === 0 && <span className={styles.selo}>Esgotado</span>}
                    </span>
                    <span className={styles.cardInfo}>
                      <strong>{produto.nome}</strong>
                      <span className={styles.preco}>{formatMoney(produto.precoCentavos)}</span>
                      {tamanhos.length > 0 && (
                        <span className={styles.tamanhos} aria-label="Tamanhos">
                          {tamanhos.map((v) => (
                            <span key={v.id} data-esgotado={v.estoque === 0}>
                              {v.nome}
                            </span>
                          ))}
                        </span>
                      )}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </>
  );
}
