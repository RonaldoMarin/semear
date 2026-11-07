"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth/guards";
import { parseMoney, slugify } from "@/lib/eventos/format";
import { onlyDigits } from "@/lib/inscricoes/validacao";
import { setWhatsappLoja } from "@/lib/loja/config";

const TIPOS_IMAGEM = ["image/jpeg", "image/webp", "image/png"];
const MAX_IMAGEM = 3 * 1024 * 1024;
const MAX_IMAGENS = 8;

/** Confere os primeiros bytes do arquivo: o tipo informado pelo navegador pode ser falsificado. */
function assinaturaValida(bytes: Uint8Array, tipo: string) {
  const comeca = (...b: number[]) => b.every((v, i) => bytes[i] === v);
  if (tipo === "image/jpeg") return comeca(0xff, 0xd8, 0xff);
  if (tipo === "image/png") return comeca(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  if (tipo === "image/webp") return comeca(0x52, 0x49, 0x46, 0x46) && String.fromCharCode(...bytes.slice(8, 12)) === "WEBP";
  return false;
}

const dadosSchema = z.object({
  codigo: z.string().trim().min(2, "Informe o código.").max(20).regex(/^[A-Za-z0-9-]+$/, "Use só letras, números e hífen."),
  nome: z.string().trim().min(2, "Dê um nome ao produto.").max(120),
  descricao: z.string().trim().max(2000),
  preco: z.string().trim().refine((v) => (parseMoney(v) ?? 0) > 0, "Informe o preço. Ex.: 45,00"),
  ativo: z.boolean(),
  temTamanhos: z.boolean(),
  variantes: z
    .array(
      z.object({
        id: z.string().optional(),
        nome: z.string().trim().max(30),
        estoque: z.number().int().min(0, "Estoque não pode ser negativo.").max(99999),
      }),
    )
    .min(1)
    .max(30),
  /** ids das fotos já salvas, na ordem final; fotos novas vêm como arquivos "nova_<posição>" */
  ordemImagens: z.array(z.string()).max(MAX_IMAGENS),
});

export type ProdutoFormDados = z.input<typeof dadosSchema>;
export type SalvarProdutoResult = { ok: true; id: string } | { ok: false; error: string };

export async function salvarProduto(id: string | null, formData: FormData): Promise<SalvarProdutoResult> {
  await requireUser("loja:gerenciar");

  let bruto: unknown;
  try {
    bruto = JSON.parse(String(formData.get("dados") ?? "{}"));
  } catch {
    return { ok: false, error: "Dados inválidos." };
  }
  const parsed = dadosSchema.safeParse(bruto);
  if (!parsed.success) return { ok: false, error: parsed.error.issues[0].message };
  const d = parsed.data;

  if (d.temTamanhos) {
    const nomes = d.variantes.map((v) => v.nome.toUpperCase());
    if (nomes.some((n) => !n)) return { ok: false, error: "Preencha o nome de cada tamanho." };
    if (new Set(nomes).size !== nomes.length) return { ok: false, error: "Há tamanhos repetidos." };
  }

  // fotos: "manter:<id>" ou "nova:<n>" na ordem escolhida
  const novas = new Map<string, File>();
  for (const [chave, valor] of formData.entries()) {
    if (chave.startsWith("nova:") && valor instanceof File) {
      if (!TIPOS_IMAGEM.includes(valor.type)) return { ok: false, error: "Use fotos JPG, PNG ou WebP." };
      if (valor.size > MAX_IMAGEM) return { ok: false, error: "Uma das fotos é grande demais (máx. 3 MB)." };
      if (!assinaturaValida(new Uint8Array(await valor.slice(0, 12).arrayBuffer()), valor.type)) return { ok: false, error: "Um dos arquivos não é uma imagem válida." };
      novas.set(chave, valor);
    }
  }

  const codigo = d.codigo.toUpperCase();
  const outroComCodigo = await db.produto.findFirst({ where: { codigo, ...(id ? { NOT: { id } } : {}) }, select: { id: true } });
  if (outroComCodigo) return { ok: false, error: `Já existe um produto com o código ${codigo}.` };

  const base = slugify(d.nome).replace(/^imagens$/, "imagens-loja") || "produto";
  let slug = base;
  for (let i = 2; await db.produto.findFirst({ where: { slug, ...(id ? { NOT: { id } } : {}) }, select: { id: true } }); i++) slug = `${base}-${i}`;

  const dados = {
    codigo,
    slug,
    nome: d.nome,
    descricao: d.descricao || null,
    precoCentavos: parseMoney(d.preco)!,
    ativo: d.ativo,
  };
  const variantes = (d.temTamanhos ? d.variantes : [{ ...d.variantes[0], nome: "" }]).map((v, ordem) => ({
    ...v,
    nome: v.nome.toUpperCase(),
    ordem,
  }));

  const produtoId = await db.$transaction(async (tx) => {
    const produto = id ? await tx.produto.update({ where: { id }, data: dados }) : await tx.produto.create({ data: dados });

    // variantes: mantém os ids existentes (o carrinho dos clientes guarda esses ids)
    const manterIds = variantes.map((v) => v.id).filter(Boolean) as string[];
    await tx.varianteProduto.deleteMany({ where: { produtoId: produto.id, id: { notIn: manterIds } } });
    for (const v of variantes) {
      if (v.id) await tx.varianteProduto.update({ where: { id: v.id }, data: { nome: v.nome, estoque: v.estoque, ordem: v.ordem } });
      else await tx.varianteProduto.create({ data: { produtoId: produto.id, nome: v.nome, estoque: v.estoque, ordem: v.ordem } });
    }

    // fotos: apaga as removidas, reordena as mantidas e cria as novas na posição certa
    const mantidas = d.ordemImagens.filter((item) => item.startsWith("manter:")).map((item) => item.slice(7));
    await tx.imagemProduto.deleteMany({ where: { produtoId: produto.id, id: { notIn: mantidas } } });
    for (const [ordem, item] of d.ordemImagens.entries()) {
      if (item.startsWith("manter:")) {
        await tx.imagemProduto.updateMany({ where: { id: item.slice(7), produtoId: produto.id }, data: { ordem } });
      } else {
        const arquivo = novas.get(item);
        if (!arquivo) continue;
        const largura = Number(formData.get(`${item}:largura`)) || 0;
        const altura = Number(formData.get(`${item}:altura`)) || 0;
        await tx.imagemProduto.create({
          data: { produtoId: produto.id, dados: Buffer.from(await arquivo.arrayBuffer()), tipo: arquivo.type, largura, altura, ordem },
        });
      }
    }
    return produto.id;
  });

  revalidatePath("/admin/loja");
  revalidatePath("/loja", "layout");
  return { ok: true, id: produtoId };
}

export async function alternarProdutoAtivo(id: string) {
  await requireUser("loja:gerenciar");
  const produto = await db.produto.findUnique({ where: { id }, select: { ativo: true } });
  if (!produto) return;
  await db.produto.update({ where: { id }, data: { ativo: !produto.ativo } });
  revalidatePath("/admin/loja");
  revalidatePath("/loja", "layout");
}

export async function excluirProduto(id: string) {
  await requireUser("loja:gerenciar");
  await db.produto.delete({ where: { id } }).catch(() => null);
  revalidatePath("/admin/loja");
  revalidatePath("/loja", "layout");
}

export type ConfigLojaState = { ok?: boolean; error?: string; valor?: string };

export async function salvarWhatsappLoja(_prev: ConfigLojaState | undefined, formData: FormData): Promise<ConfigLojaState> {
  await requireUser("loja:configurar");
  const valor = String(formData.get("whatsapp") ?? "").trim();
  const digitos = onlyDigits(valor).replace(/^55(?=\d{10,11}$)/, "");
  if (![10, 11].includes(digitos.length)) return { error: "Informe o número com DDD. Ex.: (81) 99333-6981", valor };
  const formatado = digitos.length === 11 ? `(${digitos.slice(0, 2)}) ${digitos.slice(2, 7)}-${digitos.slice(7)}` : `(${digitos.slice(0, 2)}) ${digitos.slice(2, 6)}-${digitos.slice(6)}`;
  await setWhatsappLoja(formatado);
  revalidatePath("/admin/loja");
  revalidatePath("/loja", "layout");
  return { ok: true, valor: formatado };
}
