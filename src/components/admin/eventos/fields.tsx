"use client";

import { useId } from "react";
import f from "../forms.module.css";

interface BaseProps {
  label: string;
  error?: string;
  hint?: string;
  required?: boolean;
  optional?: boolean;
}

function Shell({
  id,
  label,
  error,
  hint,
  required,
  optional,
  children,
}: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={f.field}>
      <label className={f.label} htmlFor={id}>
        {label}
        {required && <span className={f.required} aria-hidden="true">*</span>}
        {optional && <small>(opcional)</small>}
      </label>
      {children}
      {error ? (
        <p className={f.error} id={`${id}-erro`}>
          {error}
        </p>
      ) : hint ? (
        <p className={f.hint} id={`${id}-dica`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

function describedBy(id: string, error?: string, hint?: string) {
  return error ? `${id}-erro` : hint ? `${id}-dica` : undefined;
}

export function TextField({
  value,
  onChange,
  type = "text",
  placeholder,
  prefix,
  inputMode,
  maxLength,
  ...base
}: BaseProps & {
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "url" | "datetime-local" | "number" | "tel" | "email";
  placeholder?: string;
  prefix?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
  maxLength?: number;
}) {
  const id = useId();
  const input = (
    <input
      id={id}
      type={type}
      value={value}
      placeholder={placeholder}
      inputMode={inputMode}
      maxLength={maxLength}
      onChange={(event) => onChange(event.target.value)}
      className={`${f.input} ${base.error ? f.invalid : ""}`}
      aria-invalid={Boolean(base.error)}
      aria-describedby={describedBy(id, base.error, base.hint)}
      aria-required={base.required}
    />
  );
  return (
    <Shell id={id} {...base}>
      {prefix ? (
        <div className={f.inputGroup}>
          <span className={f.prefix}>{prefix}</span>
          {input}
        </div>
      ) : (
        input
      )}
    </Shell>
  );
}

export function TextArea({
  value,
  onChange,
  rows = 4,
  placeholder,
  maxLength,
  ...base
}: BaseProps & { value: string; onChange: (value: string) => void; rows?: number; placeholder?: string; maxLength?: number }) {
  const id = useId();
  return (
    <Shell id={id} {...base}>
      <textarea
        id={id}
        rows={rows}
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        className={`${f.textarea} ${base.error ? f.invalid : ""}`}
        aria-invalid={Boolean(base.error)}
        aria-describedby={describedBy(id, base.error, base.hint)}
      />
    </Shell>
  );
}

export function SelectField<T extends string>({
  value,
  onChange,
  options,
  ...base
}: BaseProps & { value: T; onChange: (value: T) => void; options: { value: T; label: string }[] }) {
  const id = useId();
  return (
    <Shell id={id} {...base}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
        className={`${f.select} ${base.error ? f.invalid : ""}`}
        aria-invalid={Boolean(base.error)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Shell>
  );
}

export function Switch({
  checked,
  onChange,
  label,
  description,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description?: string;
}) {
  return (
    <label className={f.switch}>
      <input type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span className={f.track} aria-hidden="true" />
      <span className={f.switchText}>
        <strong>{label}</strong>
        {description && <span>{description}</span>}
      </span>
    </label>
  );
}
