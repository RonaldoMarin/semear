"use client";

import { useState } from "react";
import styles from "./CopiarBotao.module.css";

/** Botão que copia um texto e mostra "Copiado!" por alguns segundos. */
export function CopiarBotao({ texto, rotulo = "Copiar", className }: { texto: string; rotulo?: string; className?: string }) {
  const [copiado, setCopiado] = useState(false);
  return (
    <button
      type="button"
      className={`${styles.botao} ${copiado ? styles.ok : ""} ${className ?? ""}`}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texto);
        } catch {
          // navegadores antigos: seleciona o texto num campo temporário
          const campo = document.createElement("textarea");
          campo.value = texto;
          document.body.appendChild(campo);
          campo.select();
          document.execCommand("copy");
          campo.remove();
        }
        setCopiado(true);
        setTimeout(() => setCopiado(false), 2500);
      }}
    >
      <span aria-live="polite">{copiado ? "Copiado!" : rotulo}</span>
    </button>
  );
}
