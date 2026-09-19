"use client";

import { useState } from "react";

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={open ? "site-header nav-open" : "site-header"}>
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="Projeto Semear, início" onClick={close}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/images/semear-texto.svg" alt="Projeto Semear" />
        </a>

        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#missao">A missão</a>
          <a href="#impacto">Impacto</a>
          <a href="#projetos">Frentes</a>
          <a href="#participar">Participe</a>
        </nav>

        <a className="header-cta" href="#participar" onClick={close}>
          Caminhe junto
        </a>

        <button
          className="nav-toggle"
          type="button"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" />
          <span aria-hidden="true" />
          <span aria-hidden="true" />
        </button>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-nav" aria-label="Navegação móvel">
          <div className="container">
            <a href="#missao" onClick={close}>A missão</a>
            <a href="#impacto" onClick={close}>Impacto</a>
            <a href="#projetos" onClick={close}>Frentes</a>
            <a href="#participar" onClick={close}>Participe</a>
            <a className="mobile-cta" href="#participar" onClick={close}>Caminhe junto</a>
          </div>
        </nav>
      )}
    </header>
  );
}