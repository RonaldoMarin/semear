"use client";

import { useActionState, useEffect, useState } from "react";
import { salvarWhatsappLoja, type ConfigLojaState } from "@/app/admin/actions/loja";
import { formatTelefone } from "@/lib/inscricoes/validacao";
import { AdminIcon } from "../AdminIcon";
import { avisar } from "../Avisos";
import f from "../forms.module.css";
import styles from "./loja.module.css";

/** Número que recebe os pedidos da loja. Só ADM altera; os demais apenas veem. */
export function WhatsappLojaForm({ valorAtual, podeEditar }: { valorAtual: string; podeEditar: boolean }) {
  const [valor, setValor] = useState(valorAtual);
  const [state, action, pending] = useActionState<ConfigLojaState | undefined, FormData>(salvarWhatsappLoja, undefined);

  useEffect(() => {
    if (state?.ok) {
      avisar({ tipo: "ok", texto: "Número dos pedidos atualizado." });
    }
  }, [state]);

  return (
    <section className={styles.config}>
      <span className={styles.configIcone}>
        <AdminIcon name="phone" size={24} />
      </span>
      <div className={f.stack} style={{ gap: 10 }}>
        <div className={styles.configTexto}>
          <strong>WhatsApp que recebe os pedidos</strong>
          <span>Quando o cliente finaliza o carrinho, o pedido abre no WhatsApp com este número.</span>
        </div>
        {podeEditar ? (
          <form action={action} className={styles.configForm}>
            <div>
              <input
                className={`${f.input} ${state?.error ? f.invalid : ""}`}
                name="whatsapp"
                type="tel"
                inputMode="tel"
                aria-label="WhatsApp dos pedidos"
                value={valor}
                onChange={(e) => setValor(formatTelefone(e.target.value))}
                placeholder="(81) 99333-6981"
                aria-invalid={Boolean(state?.error)}
              />
            </div>
            <button type="submit" className="button button-dark" disabled={pending || valor === (state?.valor ?? valorAtual)}>
              {pending ? "Salvando..." : "Salvar número"}
            </button>
            {state?.error && <p className={f.error} style={{ flexBasis: "100%", margin: 0 }}>{state.error}</p>}
          </form>
        ) : (
          <strong className={styles.preco}>{valorAtual}</strong>
        )}
      </div>
    </section>
  );
}
