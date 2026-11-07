"use client";

import { useEffect, useState } from "react";
import { AdminIcon } from "./AdminIcon";
import styles from "./Avisos.module.css";

export type Aviso = { tipo: "ok" | "erro"; texto: string };

const EVENTO = "semear:aviso";

/** Mostra um aviso no canto da tela. Funciona mesmo se quem chamou sumir da página (ex.: linha filtrada). */
export function avisar(aviso: Aviso) {
  window.dispatchEvent(new CustomEvent<Aviso>(EVENTO, { detail: aviso }));
}

/** Fica no layout do painel e exibe os avisos disparados por `avisar()`. */
export function Avisos() {
  const [lista, setLista] = useState<(Aviso & { id: number })[]>([]);

  useEffect(() => {
    const receber = (event: Event) => {
      const aviso = (event as CustomEvent<Aviso>).detail;
      const id = Date.now() + Math.random();
      setLista((atual) => [...atual.slice(-2), { ...aviso, id }]);
      setTimeout(() => setLista((atual) => atual.filter((a) => a.id !== id)), 5000);
    };
    window.addEventListener(EVENTO, receber);
    return () => window.removeEventListener(EVENTO, receber);
  }, []);

  return (
    <div className={styles.area} aria-live="polite">
      {lista.map((aviso) => (
        <div key={aviso.id} className={`${styles.aviso} ${aviso.tipo === "erro" ? styles.erro : ""}`} role="status">
          <AdminIcon name={aviso.tipo === "erro" ? "alert" : "check"} size={18} />
          {aviso.texto}
        </div>
      ))}
    </div>
  );
}
