"use client";

import { useRef } from "react";
import { AdminIcon } from "../AdminIcon";
import { InviteForm } from "./InviteForm";
import styles from "./usuarios.module.css";

/** Botão "Liberar acesso" que abre o formulário de convite num diálogo. */
export function InviteDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <button type="button" className="button button-dark" onClick={() => ref.current?.showModal()}>
        <AdminIcon name="plus" size={18} /> Liberar acesso
      </button>
      <dialog
        ref={ref}
        className={styles.dialog}
        aria-labelledby="convite-titulo"
        onClick={(event) => event.target === ref.current && ref.current?.close()}
      >
        <div className={styles.dialogInner}>
          <header className={styles.dialogHeader}>
            <div>
              <h2 id="convite-titulo">Liberar acesso</h2>
              <p>A pessoa recebe permissão para criar a própria senha em /admin/cadastro.</p>
            </div>
            <button type="button" className={styles.close} onClick={() => ref.current?.close()} aria-label="Fechar">
              <AdminIcon name="close" />
            </button>
          </header>
          <InviteForm />
        </div>
      </dialog>
    </>
  );
}
