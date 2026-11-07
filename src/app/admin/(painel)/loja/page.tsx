/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { alternarProdutoAtivo, excluirProduto } from "@/app/admin/actions/loja";
import { AdminIcon } from "@/components/admin/AdminIcon";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import s from "@/components/admin/loja/loja.module.css";
import { WhatsappLojaForm } from "@/components/admin/loja/WhatsappLojaForm";
import p from "@/components/admin/panel.module.css";
import { requireUser } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/eventos/format";
import { getWhatsappLoja } from "@/lib/loja/config";
import { urlImagem } from "@/lib/loja/produtos";

export const metadata: Metadata = { title: "Loja" };

export default async function LojaAdminPage() {
  const user = await requireUser("loja:gerenciar");
  const [produtos, whatsapp] = await Promise.all([
    db.produto.findMany({
      orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }],
      select: {
        id: true,
        codigo: true,
        nome: true,
        precoCentavos: true,
        ativo: true,
        variantes: { orderBy: { ordem: "asc" }, select: { id: true, nome: true, estoque: true } },
        imagens: { orderBy: { ordem: "asc" }, take: 1, select: { id: true } },
      },
    }),
    getWhatsappLoja(),
  ]);

  return (
    <>
      <header className={p.pageHeader}>
        <div>
          <p className={p.kicker}>Lojinha da missão</p>
          <h1>Loja</h1>
          <p>Camisetas, canecas e o que mais ajudar a missão. Os produtos visíveis aparecem em /loja no site.</p>
        </div>
        <Link href="/admin/loja/novo" className="button button-dark">
          <AdminIcon name="plus" size={18} /> Novo produto
        </Link>
      </header>

      <WhatsappLojaForm valorAtual={whatsapp} podeEditar={can(user.papel, "loja:configurar")} />

      {produtos.length === 0 ? (
        <section className={p.card}>
          <div className={p.empty}>
            <span className={p.emptyIcon}>
              <AdminIcon name="bag" size={30} />
            </span>
            <h3>Nenhum produto ainda</h3>
            <p>Cadastre o primeiro item com foto, preço, tamanhos e estoque.</p>
            <Link href="/admin/loja/novo" className="button button-primary">
              <AdminIcon name="plus" size={18} /> Cadastrar produto
            </Link>
          </div>
        </section>
      ) : (
        <div className={s.lista}>
          {produtos.map((produto) => {
            const estoque = produto.variantes.reduce((acc, v) => acc + v.estoque, 0);
            const comTamanhos = produto.variantes.some((v) => v.nome);
            return (
              <article key={produto.id} className={`${s.produto} ${produto.ativo ? "" : s.produtoOff}`}>
                <Link href={`/admin/loja/${produto.id}`} className={s.thumb} aria-label={`Editar ${produto.nome}`}>
                  {produto.imagens[0] ? <img src={urlImagem(produto.imagens[0].id)} alt="" loading="lazy" /> : <AdminIcon name="image" size={34} />}
                  {!produto.ativo ? (
                    <span className={`${s.selo} ${s.seloOff}`}>Oculto</span>
                  ) : estoque === 0 ? (
                    <span className={`${s.selo} ${s.seloSem}`}>Esgotado</span>
                  ) : null}
                </Link>
                <div className={s.produtoInfo}>
                  <small>{produto.codigo}</small>
                  <strong>{produto.nome}</strong>
                  {comTamanhos && (
                    <div className={s.tamanhos}>
                      {produto.variantes.map((v) => (
                        <span key={v.id} data-zero={v.estoque === 0} title={`${v.estoque} un.`}>
                          {v.nome}
                        </span>
                      ))}
                    </div>
                  )}
                  <div className={s.produtoMeta}>
                    <span className={s.preco}>{formatMoney(produto.precoCentavos)}</span>
                    <span className={s.estoque}>{estoque} em estoque</span>
                  </div>
                </div>
                <div className={s.produtoAcoes}>
                  <ConfirmButton
                    icon="eye"
                    label={produto.ativo ? `Ocultar ${produto.nome}` : `Mostrar ${produto.nome}`}
                    title={produto.ativo ? "Ocultar da loja?" : "Mostrar na loja?"}
                    message={
                      produto.ativo
                        ? `“${produto.nome}” deixa de aparecer no site, mas continua salvo aqui.`
                        : `“${produto.nome}” volta a aparecer na loja do site.`
                    }
                    confirmLabel={produto.ativo ? "Ocultar" : "Mostrar"}
                    action={alternarProdutoAtivo.bind(null, produto.id)}
                  />
                  <Link href={`/admin/loja/${produto.id}`} className={p.iconButton} aria-label={`Editar ${produto.nome}`} title="Editar">
                    <AdminIcon name="edit" size={18} />
                  </Link>
                  <ConfirmButton
                    icon="trash"
                    danger
                    label={`Excluir ${produto.nome}`}
                    title="Excluir produto?"
                    message={`“${produto.nome}” e suas fotos serão apagados. Itens dele que estiverem no carrinho de alguém somem. Essa ação não pode ser desfeita.`}
                    confirmLabel="Excluir"
                    action={excluirProduto.bind(null, produto.id)}
                  />
                </div>
              </article>
            );
          })}
        </div>
      )}
    </>
  );
}
