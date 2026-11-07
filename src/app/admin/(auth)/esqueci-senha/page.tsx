import type { Metadata } from "next";
import { EsqueciSenhaForm } from "@/components/admin/SenhaForms";

export const metadata: Metadata = { title: "Esqueci minha senha", robots: { index: false } };

export default function EsqueciSenhaPage() {
  return <EsqueciSenhaForm />;
}
