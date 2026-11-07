import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProdutoForm } from "@/components/admin/loja/ProdutoForm";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { centsToInput } from "@/lib/eventos/format";
import { urlImagem } from "@/lib/loja/produtos";

export const metadata: Metadata = { title: "Editar produto" };

export default async function EditarProdutoPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser("loja:gerenciar");
  const { id } = await params;
  const produto = await db.produto.findUnique({
    where: { id },
    include: {
      variantes: { orderBy: { ordem: "asc" }, select: { id: true, nome: true, estoque: true } },
      imagens: { orderBy: { ordem: "asc" }, select: { id: true } },
    },
  });
  if (!produto) notFound();

  return (
    <ProdutoForm
      inicial={{
        id: produto.id,
        codigo: produto.codigo,
        nome: produto.nome,
        descricao: produto.descricao ?? "",
        preco: centsToInput(produto.precoCentavos),
        ativo: produto.ativo,
        variantes: produto.variantes.length ? produto.variantes : [{ nome: "", estoque: 0 }],
        imagens: produto.imagens.map((img) => ({ id: img.id, url: urlImagem(img.id) })),
      }}
    />
  );
}
