import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EventWizard } from "@/components/admin/eventos/EventWizard";
import { requireUser } from "@/lib/auth/guards";
import { db } from "@/lib/db";
import { STATUS_OCUPA_VAGA } from "@/lib/inscricoes/labels";
import { can } from "@/lib/auth/permissions";
import { formatDateTime } from "@/lib/eventos/format";
import { getEventoCompleto, toFormValues } from "@/lib/eventos/queries";

export const metadata: Metadata = { title: "Editar evento" };

export default async function EditarEventoPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ criado?: string; duplicado?: string }>;
}) {
  const user = await requireUser("eventos:ver");
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const evento = await getEventoCompleto(id);
  if (!evento) notFound();

  const inscritos = can(user.papel, "inscricoes:ver")
    ? await db.inscricao.count({ where: { eventoId: evento.id, status: { in: STATUS_OCUPA_VAGA } } })
    : null;

  const flash = query.criado ? "Evento criado!" : query.duplicado ? "Cópia criada como rascunho." : undefined;

  return (
    <EventWizard
      eventoId={evento.id}
      initialValues={toFormValues(evento)}
      canPublish={can(user.papel, "eventos:publicar")}
      readOnly={!can(user.papel, "eventos:editar")}
      flash={flash}
      inscricoes={inscritos != null ? { total: inscritos, href: `/admin/inscricoes?evento=${evento.id}`, publicHref: `/inscricoes/${evento.slug}` } : undefined}
      meta={{
        criadoPor: evento.criadoPor?.nome,
        atualizadoPor: evento.atualizadoPor?.nome,
        atualizadoEm: formatDateTime(evento.atualizadoEm),
      }}
    />
  );
}
