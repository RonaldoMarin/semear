import { redirect } from "next/navigation";
import { Logo } from "@/components/site/Logo";
import { getCurrentUser } from "@/lib/auth/session";
import { siteConfig } from "@/lib/content";
import styles from "./auth.module.css";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  // quem já está logado vai direto para o painel
  if (await getCurrentUser()) redirect("/admin");

  return (
    <div className={styles.shell}>
      <aside className={styles.brand}>
        <Logo variant="claro" className={styles.logo} />
        <div className={styles.brandCopy}>
          <p className={styles.kicker}>Painel da missão</p>
          <h2>Organize cada viagem, cada equipe, cada semente.</h2>
        </div>
        <blockquote className={styles.verse}>
          “{siteConfig.verse.text}”
          <cite>{siteConfig.verse.reference}</cite>
        </blockquote>
        <span className={styles.seedA} aria-hidden="true" />
        <span className={styles.seedB} aria-hidden="true" />
      </aside>
      <main className={styles.main}>
        <div className={styles.card}>{children}</div>
      </main>
    </div>
  );
}
