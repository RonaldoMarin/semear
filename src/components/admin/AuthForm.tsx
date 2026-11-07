"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { cadastro, login, type AuthState } from "@/app/admin/actions/auth";
import f from "./forms.module.css";
import styles from "./AuthForm.module.css";

type Mode = "login" | "cadastro";

function Field({
  name,
  label,
  type = "text",
  autoComplete,
  defaultValue,
  error,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
  defaultValue?: string;
  error?: string;
  hint?: string;
}) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";

  return (
    <div className={f.field}>
      <label className={f.label} htmlFor={name}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={name}
          name={name}
          type={isPassword && visible ? "text" : type}
          autoComplete={autoComplete}
          defaultValue={defaultValue}
          className={`${f.input} ${error ? f.invalid : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-erro` : hint ? `${name}-dica` : undefined}
          required
        />
        {isPassword && (
          <button type="button" className={styles.reveal} onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
            {visible ? "Ocultar" : "Mostrar"}
          </button>
        )}
      </div>
      {error ? (
        <p id={`${name}-erro`} className={f.error}>
          {error}
        </p>
      ) : hint ? (
        <p id={`${name}-dica`} className={f.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function AuthForm({ mode }: { mode: Mode }) {
  const [state, action, pending] = useActionState<AuthState | undefined, FormData>(
    mode === "login" ? login : cadastro,
    undefined,
  );
  const errors = state?.fieldErrors ?? {};

  if (mode === "cadastro" && state?.enviado) {
    return (
      <div className={styles.wrap}>
        <header className={styles.header}>
          <p className="eyebrow">Primeiro acesso</p>
          <h1>Confira seu e-mail</h1>
          <p>
            Enviamos para <strong>{state.enviado}</strong> um link para você criar sua senha. Ele vale por 24 horas. Se não aparecer em alguns minutos, olhe a
            caixa de spam.
          </p>
        </header>
        <p className={styles.switch}>
          Já criou a senha? <Link href="/admin/login">Entrar</Link>
        </p>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className="eyebrow">{mode === "login" ? "Bem-vindo de volta" : "Primeiro acesso"}</p>
        <h1>{mode === "login" ? "Entrar no painel" : "Criar sua conta"}</h1>
        <p>
          {mode === "login"
            ? "Use o e-mail e a senha cadastrados para acessar o painel da missão."
            : "Somente e-mails liberados pela coordenação conseguem criar conta. Vamos mandar um link para você criar sua senha."}
        </p>
      </header>

      <form action={action} className={styles.form} noValidate>
        {state?.error && (
          <div className={f.alert} role="alert">
            {state.error}
          </div>
        )}

        {mode === "cadastro" && (
          <Field name="nome" label="Nome completo" autoComplete="name" defaultValue={state?.values?.nome} error={errors.nome} />
        )}
        <Field name="email" label="E-mail" type="email" autoComplete="email" defaultValue={state?.values?.email} error={errors.email} />
        {mode === "login" && (
          <>
            <Field name="senha" label="Senha" type="password" autoComplete="current-password" error={errors.senha} />
            <Link href="/admin/esqueci-senha" className={styles.forgot}>
              Esqueci minha senha
            </Link>
          </>
        )}

        <button className={`button button-dark ${styles.submit}`} type="submit" disabled={pending}>
          {pending ? "Aguarde..." : mode === "login" ? "Entrar" : "Receber link por e-mail"}
        </button>
      </form>

      <p className={styles.switch}>
        {mode === "login" ? (
          <>
            Primeiro acesso? <Link href="/admin/cadastro">Criar conta</Link>
          </>
        ) : (
          <>
            Já tem conta? <Link href="/admin/login">Entrar</Link>
          </>
        )}
      </p>
      <p className={styles.back}>
        <Link href="/">← Voltar para o site</Link>
      </p>
    </div>
  );
}
