import type { Metadata } from "next";
import Link from "next/link";
import { verificarToken } from "@/app/admin/actions/senha";
import { RedefinirSenhaForm } from "@/components/admin/SenhaForms";
import styles from "@/components/admin/AuthForm.module.css";

export const metadata: Metadata = { title: "Criar nova senha", robots: { index: false } };

export default async function RedefinirSenhaPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  const status = await verificarToken(token);

  if (!status.valido) {
    return (
      <div className={styles.wrap}>
        <header className={styles.header}>
          <p className="eyebrow">Recuperar acesso</p>
          <h1>Link expirado</h1>
          <p>Este link expirou ou já foi usado. Cada link funciona uma única vez. Peça outro abaixo.</p>
        </header>
        <Link href="/admin/esqueci-senha" className={`button button-dark ${styles.submit}`}>
          Pedir um novo link
        </Link>
        <p className={styles.switch}>
          <Link href="/admin/login">Voltar para o login</Link>
        </p>
      </div>
    );
  }

  return <RedefinirSenhaForm token={token} email={status.email} primeiroAcesso={status.primeiroAcesso} />;
}
