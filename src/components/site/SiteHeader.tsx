"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CarrinhoBotao, useCarrinho } from "@/components/loja/Carrinho";
import { siteConfig } from "@/lib/content";
import { Logo } from "./Logo";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const close = () => setOpen(false);
  const pathname = usePathname();
  const { quantidade } = useCarrinho();
  const mostrarCarrinho = quantidade > 0 || pathname.startsWith("/loja");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const className = [styles.header, scrolled && styles.scrolled, open && styles.open]
    .filter(Boolean)
    .join(" ");

  return (
    <header className={className}>
      <div className={`container ${styles.inner}`}>
        <Link className={styles.brand} href="/" aria-label="Semear no Sertão, página inicial" onClick={close}>
          <Logo className={styles.logo} />
        </Link>

        <nav className={styles.nav} aria-label="Navegação principal">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.acoes}>
          {mostrarCarrinho && <CarrinhoBotao />}
          <a className={`button button-dark ${styles.cta}`} href={siteConfig.links.participation}>
            Quero participar
          </a>

          <button
            className={styles.toggle}
            type="button"
            aria-expanded={open}
            aria-controls="menu-movel"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <nav id="menu-movel" className={styles.mobile} aria-label="Navegação móvel" hidden={!open}>
        <div className="container">
          {siteConfig.navigation.map((item) => (
            <Link key={item.href} href={item.href} onClick={close}>
              {item.label}
            </Link>
          ))}
          <a
            className={`button button-primary ${styles.mobileCta}`}
            href={siteConfig.links.participation}
            onClick={close}
          >
            Quero participar
          </a>
        </div>
      </nav>
    </header>
  );
}
