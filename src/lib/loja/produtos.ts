import "server-only";
import type { Prisma } from "@prisma/client";
import { db } from "@/lib/db";

export const produtoPublicoSelect = {
  id: true,
  codigo: true,
  slug: true,
  nome: true,
  descricao: true,
  precoCentavos: true,
  variantes: { orderBy: { ordem: "asc" }, select: { id: true, nome: true, estoque: true } },
  imagens: { orderBy: { ordem: "asc" }, select: { id: true, largura: true, altura: true } },
} satisfies Prisma.ProdutoSelect;

export type ProdutoPublico = Prisma.ProdutoGetPayload<{ select: typeof produtoPublicoSelect }>;

export function listarProdutosPublicos() {
  return db.produto.findMany({ where: { ativo: true }, orderBy: [{ ordem: "asc" }, { criadoEm: "desc" }], select: produtoPublicoSelect });
}

export function getProdutoPublico(slug: string) {
  return db.produto.findFirst({ where: { slug, ativo: true }, select: produtoPublicoSelect });
}

/** Endereço da foto servida pelo site (cada foto nova tem id novo, então o cache nunca fica velho). */
export const urlImagem = (id: string) => `/loja/imagens/${id}`;

/** Próximo código livre: SEM-001, SEM-002... */
export async function proximoCodigo() {
  const ultimos = await db.produto.findMany({ where: { codigo: { startsWith: "SEM-" } }, select: { codigo: true } });
  const maior = ultimos.reduce((max, p) => Math.max(max, Number(p.codigo.slice(4)) || 0), 0);
  return `SEM-${String(maior + 1).padStart(3, "0")}`;
}
