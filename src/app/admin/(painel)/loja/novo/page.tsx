import type { Metadata } from "next";
import { ProdutoForm } from "@/components/admin/loja/ProdutoForm";
import { requireUser } from "@/lib/auth/guards";
import { proximoCodigo } from "@/lib/loja/produtos";

export const metadata: Metadata = { title: "Novo produto" };

export default async function NovoProdutoPage() {
  await requireUser("loja:gerenciar");
  return (
    <ProdutoForm
      inicial={{
        id: null,
        codigo: await proximoCodigo(),
        nome: "",
        descricao: "",
        preco: "",
        ativo: true,
        variantes: [{ nome: "", estoque: 0 }],
        imagens: [],
      }}
    />
  );
}
