import "server-only";
import type { Prisma, StatusInscricao } from "@prisma/client";
import { formatCpf } from "./validacao";

export const statusInscricaoLista: StatusInscricao[] = ["PENDENTE", "CONFIRMADA", "LISTA_ESPERA", "CANCELADA"];

export const periodos = {
  "7d": { label: "Últimos 7 dias", dias: 7 },
  "30d": { label: "Últimos 30 dias", dias: 30 },
  "90d": { label: "Últimos 90 dias", dias: 90 },
} as const;
export type Periodo = keyof typeof periodos;

export interface FiltrosInscricao {
  q: string;
  evento?: string;
  status?: StatusInscricao;
  periodo?: Periodo;
  pagina: number;
}

type Params = Record<string, string | string[] | undefined>;
const primeiro = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v) ?? "";

export function lerFiltros(params: Params): FiltrosInscricao {
  const status = primeiro(params.status);
  const periodo = primeiro(params.periodo);
  const pagina = Number.parseInt(primeiro(params.pagina), 10);
  return {
    q: primeiro(params.q).trim().slice(0, 100),
    evento: primeiro(params.evento) || undefined,
    status: statusInscricaoLista.includes(status as StatusInscricao) ? (status as StatusInscricao) : undefined,
    periodo: periodo in periodos ? (periodo as Periodo) : undefined,
    pagina: Number.isFinite(pagina) && pagina > 0 ? pagina : 1,
  };
}

/** Filtro base (sem situação) — usado também para os contadores por situação. */
export function whereBase(f: FiltrosInscricao): Prisma.InscricaoWhereInput {
  const digitos = f.q.replace(/\D/g, "");
  return {
    ...(f.evento ? { eventoId: f.evento } : {}),
    ...(f.periodo ? { criadoEm: { gte: new Date(Date.now() - periodos[f.periodo].dias * 86_400_000) } } : {}),
    ...(f.q
      ? {
          OR: [
            { nome: { contains: f.q, mode: "insensitive" } },
            { email: { contains: f.q, mode: "insensitive" } },
            // CPF fica salvo formatado: "52998224725" também encontra "529.982.247-25"
            ...(digitos.length === 11 ? [{ cpf: formatCpf(digitos) }] : []),
            { cpf: { contains: f.q } },
            { telefone: { contains: f.q } },
          ],
        }
      : {}),
  };
}

export function whereCompleto(f: FiltrosInscricao): Prisma.InscricaoWhereInput {
  return { ...whereBase(f), ...(f.status ? { status: f.status } : {}) };
}

/** Monta a URL mantendo os filtros atuais e trocando só o que for passado. */
export function urlFiltros(base: string, f: FiltrosInscricao, troca: Partial<Record<keyof FiltrosInscricao, string | number | undefined>>) {
  const params = new URLSearchParams();
  const valores = { q: f.q, evento: f.evento, status: f.status, periodo: f.periodo, pagina: f.pagina > 1 ? f.pagina : undefined, ...troca };
  for (const [chave, valor] of Object.entries(valores)) if (valor) params.set(chave, String(valor));
  const query = params.toString();
  return `${base}${query ? `?${query}` : ""}`;
}
