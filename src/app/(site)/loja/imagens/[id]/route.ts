import { db } from "@/lib/db";

/** Entrega a foto de um produto. Cada foto nova ganha um id novo, então pode ficar em cache "para sempre". */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const imagem = await db.imagemProduto.findUnique({ where: { id }, select: { dados: true, tipo: true } });
  if (!imagem) return new Response("Foto não encontrada", { status: 404 });

  return new Response(new Uint8Array(imagem.dados), {
    headers: {
      "Content-Type": imagem.tipo,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      "Content-Security-Policy": "default-src 'none'; sandbox",
    },
  });
}
