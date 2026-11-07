"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { redefinirSenha, solicitarRedefinicao, type EsqueciState, type RedefinirState } from "@/app/admin/actions/senha";
import { AdminIcon } from "./AdminIcon";
import f from "./forms.module.css";
import styles from "./AuthForm.module.css";

function PasswordInput({ name, label, error, hint, autoFocus }: { name: string; label: string; error?: string; hint?: string; autoFocus?: boolean }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className={f.field}>
      <label className={f.label} htmlFor={name}>
        {label}
      </label>
      <div className={styles.inputWrap}>
        <input
          id={name}
          name={name}
          type={visible ? "text" : "password"}
          autoComplete="new-password"
          autoFocus={autoFocus}
          className={`${f.input} ${error ? f.invalid : ""}`}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${name}-erro` : hint ? `${name}-dica` : undefined}
          required
        />
        <button type="button" className={styles.reveal} onClick={() => setVisible((v) => !v)} aria-pressed={visible}>
          {visible ? "Ocultar" : "Mostrar"}
        </button>
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

export function EsqueciSenhaForm() {
  const [state, action, pending] = useActionState<EsqueciState | undefined, FormData>(solicitarRedefinicao, undefined);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className="eyebrow">Recuperar acesso</p>
        <h1>Esqueci minha senha</h1>
        <p>Informe o e-mail da sua conta. Enviaremos um link para você criar uma nova senha.</p>
      </header>

      {state?.enviado ? (
        <div className={styles.sent} role="status">
          <span className={styles.sentIcon} aria-hidden="true">
            <AdminIcon name="check" size={26} />
          </span>
          <h2>Confira seu e-mail</h2>
          <p>
            Se <strong>{state.email}</strong> tiver acesso ao painel, você vai receber em instantes um link para redefinir a senha. O link
            vale por 1 hora.
          </p>
          <p className={styles.small}>Não chegou? Olhe a caixa de spam ou peça de novo em alguns minutos.</p>
        </div>
      ) : (
        <form action={action} className={styles.form} noValidate>
          {state?.error && (
            <div className={f.alert} role="alert">
              {state.error}
            </div>
          )}
          <div className={f.field}>
            <label className={f.label} htmlFor="email">
              E-mail
            </label>
            <input id="email" name="email" type="email" autoComplete="email" className={f.input} required autoFocus />
          </div>
          <button className={`button button-dark ${styles.submit}`} type="submit" disabled={pending}>
            {pending ? "Enviando..." : "Enviar link"}
          </button>
        </form>
      )}

      <p className={styles.switch}>
        Lembrou a senha? <Link href="/admin/login">Entrar</Link>
      </p>
    </div>
  );
}

export function RedefinirSenhaForm({ token, email, primeiroAcesso }: { token: string; email: string; primeiroAcesso: boolean }) {
  const [state, action, pending] = useActionState<RedefinirState | undefined, FormData>(redefinirSenha, undefined);

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <p className="eyebrow">{primeiroAcesso ? "Primeiro acesso" : "Recuperar acesso"}</p>
        <h1>{primeiroAcesso ? "Crie sua senha" : "Criar nova senha"}</h1>
        <p>
          {primeiroAcesso ? "Senha" : "Nova senha"} para <strong>{email}</strong>.
        </p>
      </header>

      <form action={action} className={styles.form} noValidate>
        {state?.error && (
          <div className={f.alert} role="alert">
            {state.error} <Link href="/admin/esqueci-senha">Pedir novo link</Link>
          </div>
        )}
        <input type="hidden" name="token" value={token} />
        <PasswordInput name="senha" label="Nova senha" error={state?.fieldErrors?.senha} hint="Mínimo de 8 caracteres, com letras e números." autoFocus />
        <PasswordInput name="confirmacao" label="Confirme a nova senha" error={state?.fieldErrors?.confirmacao} />
        <button className={`button button-dark ${styles.submit}`} type="submit" disabled={pending}>
          {pending ? "Salvando..." : primeiroAcesso ? "Criar senha e entrar" : "Salvar nova senha"}
        </button>
      </form>
    </div>
  );
}
