import { redirect } from "next/navigation";

/** Endereço antigo: as inscrições agora ficam na aba "Inscrições", filtradas pelo evento. */
export default async function InscricoesDoEvento({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/inscricoes?evento=${encodeURIComponent(id)}`);
}
