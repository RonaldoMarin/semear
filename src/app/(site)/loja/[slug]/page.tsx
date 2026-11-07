import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProdutoCompra } from "@/components/loja/ProdutoCompra";
import { ProdutoGaleria } from "@/components/loja/ProdutoGaleria";
import { getProdutoPublico, urlImagem } from "@/lib/loja/produtos";
import styles from "../loja.module.css";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const produto = await getProdutoPublico(slug);
  if (!produto) return { title: "Produto não encontrado" };
  return {
    title: `${produto.nome} | Loja`,
    description: produto.descricao?.slice(0, 160) ?? "Produto da lojinha do Semear no Sertão.",
    openGraph: produto.imagens[0] ? { images: [urlImagem(produto.imagens[0].id)] } : undefined,
  };
}

export default async function ProdutoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const produto = await getProdutoPublico(slug);
  if (!produto) notFound();

  return (
    <div className={`container ${styles.produto}`}>
      <nav className={styles.trilha} aria-label="Você está em">
        <Link href="/loja">Loja</Link>
        <span aria-hidden="true">/</span>
        <span>{produto.nome}</span>
      </nav>

      <div className={styles.produtoGrid}>
        <ProdutoGaleria nome={produto.nome} imagens={produto.imagens.map((img) => ({ id: img.id, url: urlImagem(img.id) }))} />

        <div className={styles.detalhes}>
          <p className={styles.codigo}>Cód. {produto.codigo}</p>
          <h1>{produto.nome}</h1>
          <ProdutoCompra
            produto={{
              id: produto.id,
              slug: produto.slug,
              codigo: produto.codigo,
              nome: produto.nome,
              precoCentavos: produto.precoCentavos,
              imagemId: produto.imagens[0]?.id ?? null,
              variantes: produto.variantes,
            }}
          />
          {produto.descricao && (
            <div className={styles.descricao}>
              <h2>Sobre o produto</h2>
              {produto.descricao.split(/\n{2,}/).map((paragrafo, i) => (
                <p key={i}>{paragrafo}</p>
              ))}
            </div>
          )}
          <aside className={styles.comoFunciona}>
            <strong>Como funciona</strong>
            <ol>
              <li>Escolha os itens e adicione ao carrinho.</li>
              <li>Finalize: abrimos o WhatsApp com o pedido pronto.</li>
              <li>A equipe combina com você o pagamento e a entrega.</li>
            </ol>
          </aside>
        </div>
      </div>
    </div>
  );
}
