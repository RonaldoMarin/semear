"use client";

import { useActionState, useEffect, useRef } from "react";
import type { Papel } from "@prisma/client";
import { convidarUsuario, type ConviteState } from "@/app/admin/actions/usuarios";
import { papelDescricao, papelLabel } from "@/lib/auth/permissions";
import { AdminIcon } from "../AdminIcon";
import f from "../forms.module.css";
import styles from "./usuarios.module.css";

const papeis: Papel[] = ["ACESSO", "VOLUNTARIO", "ADM"];

export function InviteForm() {
  const [state, action, pending] = useActionState<ConviteState | undefined, FormData>(convidarUsuario, undefined);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={action} className={styles.inviteForm} noValidate>
      {state?.error && <div className={f.alert}>{state.error}</div>}
      {state?.message && (
        <div className={`${f.alert} ${f.alertSuccess}`}>
          <AdminIcon name="check" /> {state.message}
        </div>
      )}
      <div className={f.field}>
        <label className={f.label} htmlFor="convite-nome">Nome</label>
        <input id="convite-nome" name="nome" className={`${f.input} ${state?.fieldErrors?.nome ? f.invalid : ""}`} placeholder="Nome da pessoa" required />
        {state?.fieldErrors?.nome && <p className={f.error}>{state.fieldErrors.nome}</p>}
      </div>
      <div className={f.field}>
        <label className={f.label} htmlFor="convite-email">E-mail</label>
        <input id="convite-email" name="email" type="email" className={`${f.input} ${state?.fieldErrors?.email ? f.invalid : ""}`} placeholder="pessoa@email.com" required />
        {state?.fieldErrors?.email && <p className={f.error}>{state.fieldErrors.email}</p>}
      </div>
      <fieldset className={styles.roles}>
        <legend className={f.label}>Permissão</legend>
        {papeis.map((papel) => (
          <label key={papel} className={styles.roleOption}>
            <input type="radio" name="papel" value={papel} defaultChecked={papel === "VOLUNTARIO"} />
            <span>
              <strong>{papelLabel[papel]}</strong>
              <small>{papelDescricao[papel]}</small>
            </span>
          </label>
        ))}
      </fieldset>
      <button type="submit" className="button button-dark" disabled={pending}>
        <AdminIcon name="plus" size={18} /> {pending ? "Liberando..." : "Liberar acesso"}
      </button>
    </form>
  );
}
