"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Papel } from "@prisma/client";
import { logout } from "@/app/admin/actions/auth";
import { Logo } from "@/components/site/Logo";
import { papelLabel } from "@/lib/auth/permissions";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import { Avisos } from "./Avisos";
import styles from "./AdminShell.module.css";

interface ShellUser {
  nome: string;
  email: string;
  papel: Papel;
}

export function AdminShell({
  user,
  canManageUsers,
  canSeeInscricoes,
  canSeeLoja,
  children,
}: {
  user: ShellUser;
  canManageUsers: boolean;
  canSeeInscricoes: boolean;
  canSeeLoja: boolean;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const nav: { href: string; label: string; icon: AdminIconName; exact?: boolean }[] = [
    { href: "/admin", label: "Painel", icon: "home", exact: true },
    { href: "/admin/eventos", label: "Eventos", icon: "calendar" },
    ...(canSeeInscricoes ? [{ href: "/admin/inscricoes", label: "Inscrições", icon: "list" as const }] : []),
    ...(canSeeLoja ? [{ href: "/admin/loja", label: "Loja", icon: "bag" as const }] : []),
    ...(canManageUsers ? [{ href: "/admin/usuarios", label: "Usuários", icon: "users" as const }] : []),
  ];

  const isActive = (href: string, exact?: boolean) => (exact ? pathname === href : pathname.startsWith(href));
  const initials = user.nome
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className={`${styles.shell} ${open ? styles.open : ""}`}>
      <aside className={styles.sidebar} aria-label="Menu do painel">
        <div className={styles.sidebarTop}>
          <Link href="/admin" className={styles.brand} aria-label="Painel Semear no Sertão">
            <Logo variant="claro" className={styles.logo} />
          </Link>
          <span className={styles.badge}>Painel</span>
        </div>

        <nav className={styles.nav}>
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className={isActive(item.href, item.exact) ? styles.active : undefined}
              aria-current={isActive(item.href, item.exact) ? "page" : undefined}
            >
              <AdminIcon name={item.icon} />
              {item.label}
            </Link>
          ))}
          <a href="/" target="_blank" rel="noopener noreferrer" className={styles.siteLink}>
            <AdminIcon name="external" />
            Ver o site
          </a>
        </nav>

        <div className={styles.userCard}>
          <span className={styles.avatar} aria-hidden="true">
            {initials}
          </span>
          <div className={styles.userInfo}>
            <strong>{user.nome}</strong>
            <span>{papelLabel[user.papel]}</span>
          </div>
          <form action={logout}>
            <button type="submit" className={styles.logout} aria-label="Sair do painel" title="Sair">
              <AdminIcon name="logout" />
            </button>
          </form>
        </div>
      </aside>

      <div className={styles.scrim} onClick={() => setOpen(false)} aria-hidden="true" />

      <div className={styles.content}>
        <header className={styles.mobileBar}>
          <button type="button" className={styles.menuButton} onClick={() => setOpen(true)} aria-label="Abrir menu">
            <AdminIcon name="menu" />
          </button>
          <Logo className={styles.mobileLogo} />
        </header>
        <main className={styles.main}>{children}</main>
        <Avisos />
      </div>
    </div>
  );
}
