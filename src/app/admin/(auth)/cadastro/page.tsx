import type { Metadata } from "next";
import { AuthForm } from "@/components/admin/AuthForm";

export const metadata: Metadata = { title: "Criar conta", robots: { index: false } };

export default function CadastroPage() {
  return <AuthForm mode="cadastro" />;
}
