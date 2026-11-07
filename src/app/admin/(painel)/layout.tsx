import type { Metadata } from "next";
import { AdminShell } from "@/components/admin/AdminShell";
import { requireUser } from "@/lib/auth/guards";
import { can } from "@/lib/auth/permissions";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel Semear" },
  robots: { index: false, follow: false },
};

export default async function PainelLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <AdminShell user={user} canManageUsers={can(user.papel, "usuarios:gerenciar")} canSeeInscricoes={can(user.papel, "inscricoes:ver")} canSeeLoja={can(user.papel, "loja:gerenciar")}>
      {children}
    </AdminShell>
  );
}
