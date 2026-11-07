"use client";

import { useTransition } from "react";
import type { Papel } from "@prisma/client";
import { alterarPapel } from "@/app/admin/actions/usuarios";
import { papelLabel } from "@/lib/auth/permissions";
import styles from "./usuarios.module.css";

export function RoleSelect({ id, papel, nome }: { id: string; papel: Papel; nome: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <select
      className={styles.roleSelect}
      defaultValue={papel}
      disabled={pending}
      aria-label={`Permissão de ${nome}`}
      onChange={(event) => {
        const value = event.target.value as Papel;
        startTransition(() => alterarPapel(id, value));
      }}
    >
      {(Object.keys(papelLabel) as Papel[]).map((p) => (
        <option key={p} value={p}>
          {papelLabel[p]}
        </option>
      ))}
    </select>
  );
}
