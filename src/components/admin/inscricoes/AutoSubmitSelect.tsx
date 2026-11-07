"use client";

import styles from "./inscricoes.module.css";

/** Select de filtro que aplica sozinho ao trocar (sem precisar de botão "Filtrar"). */
export function AutoSubmitSelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className={styles.filter}>
      <span>{label}</span>
      <select name={name} defaultValue={defaultValue ?? ""} onChange={(event) => event.currentTarget.form?.requestSubmit()}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
