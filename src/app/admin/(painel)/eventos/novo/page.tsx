import type { Metadata } from "next";
import { EventWizard } from "@/components/admin/eventos/EventWizard";
import { requireUser } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";
import { emptyEvento } from "@/lib/eventos/defaults";

export const metadata: Metadata = { title: "Novo evento" };

export default async function NovoEventoPage() {
  const user = await requireUser("eventos:editar");
  return <EventWizard eventoId={null} initialValues={emptyEvento()} canPublish={can(user.papel, "eventos:publicar")} readOnly={false} />;
}
