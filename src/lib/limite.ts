import "server-only";
import { headers } from "next/headers";

/*
 * Limite de tentativas em memória (janela deslizante).
 * Serve para um servidor Node único (como na Hostinger). Se um dia rodar em várias
 * instâncias, troque por um armazenamento compartilhado (Redis ou uma tabela no banco).
 */

const baldes = new Map<string, number[]>();
let ultimaLimpeza = Date.now();

function limparAntigos(agora: number) {
  if (agora - ultimaLimpeza < 10 * 60 * 1000) return;
  ultimaLimpeza = agora;
  for (const [chave, tempos] of baldes) {
    if (!tempos.length || agora - tempos[tempos.length - 1] > 24 * 60 * 60 * 1000) baldes.delete(chave);
  }
}

/** Registra uma tentativa. Retorna false se a chave já passou de `max` tentativas na janela. */
export function permitir(chave: string, max: number, janelaMs: number) {
  const agora = Date.now();
  limparAntigos(agora);
  const tempos = (baldes.get(chave) ?? []).filter((t) => agora - t < janelaMs);
  if (tempos.length >= max) {
    baldes.set(chave, tempos);
    return false;
  }
  tempos.push(agora);
  baldes.set(chave, tempos);
  return true;
}

/** Zera o contador (ex.: depois de um login certo). */
export function zerar(chave: string) {
  baldes.delete(chave);
}

/** IP do visitante, informado pelo proxy da hospedagem. */
export async function ipDoVisitante() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "desconhecido";
}

export const MINUTO = 60 * 1000;
export const HORA = 60 * MINUTO;
