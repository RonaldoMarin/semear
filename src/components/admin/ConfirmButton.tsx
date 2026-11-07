"use client";

import { useRef, useTransition } from "react";
import { AdminIcon, type AdminIconName } from "./AdminIcon";
import styles from "./panel.module.css";

/** Botão de ícone que abre um diálogo de confirmação antes de executar uma server action. */
export function ConfirmButton({
  icon,
  label,
  title,
  message,
  confirmLabel,
  danger,
  action,
}: {
  icon: AdminIconName;
  label: string;
  title: string;
  message: string;
  confirmLabel: string;
  danger?: boolean;
  action: () => Promise<void>;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [pending, startTransition] = useTransition();

  return (
    <>
      <button
        type="button"
        className={`${styles.iconButton} ${danger ? styles.iconDanger : ""}`}
        onClick={() => dialogRef.current?.showModal()}
        aria-label={label}
        title={label}
      >
        <AdminIcon name={icon} size={18} />
      </button>
      <dialog ref={dialogRef} className={styles.dialog} aria-labelledby={`${label}-titulo`}>
        <div className={styles.dialogBody}>
          <h2 id={`${label}-titulo`}>{title}</h2>
          <p>{message}</p>
        </div>
        <div className={styles.dialogFooter}>
          <button type="button" className="button button-outline" onClick={() => dialogRef.current?.close()} disabled={pending}>
            Cancelar
          </button>
          <button
            type="button"
            className={`button ${danger ? styles.buttonDanger : "button-dark"}`}
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                await action();
                dialogRef.current?.close();
              })
            }
          >
            {pending ? "Aguarde..." : confirmLabel}
          </button>
        </div>
      </dialog>
    </>
  );
}
