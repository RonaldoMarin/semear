import type { Metadata } from "next";
import { AuthForm } from "@/components/admin/AuthForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false } };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
