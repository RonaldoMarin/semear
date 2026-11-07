"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import { formatMoney } from "@/lib/eventos/format";
import { formatarNome } from "@/lib/inscricoes/validacao";
import type { ItemCarrinho } from "@/lib/loja/carrinho";
import { getWhatsappLoja } from "@/lib/loja/config";
import { MINUTO, ipDoVisitante, permitir } from "@/lib/limite";
import { linkWhatsApp } from "@/lib/whatsapp";

const pedidoSchema = z.object({
  nome: z.string().trim().min(3, "Informe seu nome para o pedido.").max(80),
  observacao: z.string().trim().max(400).default(""),
  itens: z
    .array(
      z.object({
        varianteId: z.string().min(1).max(40),
        quantidade: z.number().int().min(1).max(99),
        precoCentavos: z.number().int(),
      }),
    )
    .min(1, "Seu carrinho está vazio.")
    .max(40),
});

export type PedidoInput = z.input<typeof pedidoSchema>;
export type FinalizarPedidoResult =
  | { ok: true; url: string; itens: ItemCarrinho[] }
  | { ok: false; error: string; itens?: ItemCarrinho[] };

/**
 * Confere o carrinho com o banco (produto ativo, preço atual, estoque) e monta a mensagem do WhatsApp.
 * Se algo mudou, devolve o carrinho corrigido para o cliente revisar antes de enviar.
 */
export async function finalizarPedido(input: PedidoInput): Promise<FinalizarPedidoResult> {
  if (!permitir(`loja:ip:${await ipDoVisitante()}`, 40, 10 * MINUTO)) return { ok: false, error: "Muitas tentativas seguidas. Aguarde alguns minutos." };
  const parsed = pedidoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const { observacao } = parsed.data;
  const nome = formatarNome(parsed.data.nome);

  const variantes = await db.varianteProduto.findMany({
    where: { id: { in: parsed.data.itens.map((i) => i.varianteId) } },
    include: {
      produto: {
        select: { id: true, slug: true, codigo: true, nome: true, precoCentavos: true, ativo: true, imagens: { orderBy: { ordem: "asc" }, take: 1, select: { id: true } } },
      },
    },
  });
  const porId = new Map(variantes.map((v) => [v.id, v]));

  const avisos: string[] = [];
  const itens: ItemCarrinho[] = [];
  for (const pedido of parsed.data.itens) {
    const v = porId.get(pedido.varianteId);
    if (!v || !v.produto.ativo) {
      avisos.push("um item saiu da loja e foi removido");
      continue;
    }
    const rotulo = v.nome ? `${v.produto.nome} (${v.nome})` : v.produto.nome;
    if (v.estoque <= 0) {
      avisos.push(`${rotulo} esgotou`);
      continue;
    }
    let quantidade = pedido.quantidade;
    if (quantidade > v.estoque) {
      quantidade = v.estoque;
      avisos.push(`${rotulo}: só ${v.estoque === 1 ? "resta 1 unidade" : `restam ${v.estoque} unidades`}`);
    }
    if (pedido.precoCentavos !== v.produto.precoCentavos) avisos.push(`o preço de ${v.produto.nome} mudou para ${formatMoney(v.produto.precoCentavos)}`);
    itens.push({
      varianteId: v.id,
      produtoId: v.produto.id,
      slug: v.produto.slug,
      codigo: v.produto.codigo,
      nome: v.produto.nome,
      tamanho: v.nome,
      precoCentavos: v.produto.precoCentavos,
      imagemId: v.produto.imagens[0]?.id ?? null,
      quantidade,
      estoque: v.estoque,
    });
  }

  if (avisos.length) {
    const texto = [...new Set(avisos)].join("; ");
    return { ok: false, error: `Atualizamos seu carrinho: ${texto}. Confira e envie de novo.`, itens };
  }

  const total = itens.reduce((acc, i) => acc + i.precoCentavos * i.quantidade, 0);
  const linhas = itens.map((i, n) => {
    const detalhes = [i.tamanho && `Tamanho: ${i.tamanho}`, `Qtd: ${i.quantidade} × ${formatMoney(i.precoCentavos)} = ${formatMoney(i.precoCentavos * i.quantidade)}`]
      .filter(Boolean)
      .join(" · ");
    return `${n + 1}. *${i.nome}* (cód. ${i.codigo})\n   ${detalhes}`;
  });

  const mensagem = [
    "Olá! Quero fazer um pedido na lojinha do Semear no Sertão 🌵",
    "",
    "*Pedido*",
    ...linhas,
    "",
    `*Total: ${formatMoney(total)}*`,
    "",
    `Nome: ${nome}`,
    ...(observacao ? [`Observação: ${observacao}`] : []),
  ]
    .join("\n")
    .replace(/ /g, " ");

  return { ok: true, url: linkWhatsApp(await getWhatsappLoja(), mensagem), itens };
}
