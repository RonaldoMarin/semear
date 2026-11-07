"use client";

/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import styles from "./ProdutoCompra.module.css";

export function ProdutoGaleria({ nome, imagens }: { nome: string; imagens: { id: string; url: string }[] }) {
  const [atual, setAtual] = useState(0);

  if (imagens.length === 0) {
    return (
      <div className={styles.galeria}>
        <div className={`${styles.principal} ${styles.semFoto}`}>
          <Icon name="bag" size={56} />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.galeria}>
      <div className={styles.principal}>
        <img src={imagens[atual].url} alt={`${nome}, foto ${atual + 1} de ${imagens.length}`} />
      </div>
      {imagens.length > 1 && (
        <div className={styles.miniaturas} role="list">
          {imagens.map((img, i) => (
            <button
              key={img.id}
              type="button"
              role="listitem"
              className={i === atual ? styles.miniAtiva : undefined}
              onClick={() => setAtual(i)}
              aria-label={`Ver foto ${i + 1}`}
              aria-current={i === atual}
            >
              <img src={img.url} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
