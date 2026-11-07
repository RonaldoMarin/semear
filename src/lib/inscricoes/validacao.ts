import type { TipoPergunta } from "@prisma/client";

/* Validação das respostas do formulário público.
   Roda no navegador (feedback imediato) e no servidor (validação final). */

export interface PerguntaPublica {
  id: string;
  chave: string | null;
  secao: string | null;
  condicaoChave: string | null;
  condicaoValor: string | null;
  label: string;
  ajuda: string | null;
  tipo: TipoPergunta;
  opcoes: string[];
  obrigatoria: boolean;
}

export type ValorResposta = string | string[];
export type RespostasBrutas = Record<string, ValorResposta>;

export interface RespostaSalva {
  label: string;
  tipo: TipoPergunta;
  valor: ValorResposta;
}

export const onlyDigits = (value: string) => value.replace(/\D/g, "");

const PARTICULAS = new Set(["da", "das", "de", "do", "dos", "e"]);

/** "RONALDO BENTO DA SILVA" → "Ronaldo Bento da Silva" (cada nome com a primeira letra maiúscula). */
export function formatarNome(nome: string) {
  return nome
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("pt-BR")
    .split(" ")
    .map((palavra, i) =>
      i > 0 && PARTICULAS.has(palavra)
        ? palavra
        : // nomes compostos com hífen ou apóstrofo: "ana-clara" → "Ana-Clara", "d'ávila" → "D'Ávila"
          palavra.replace(/(^|[-'’])(\p{L})/gu, (_, sep: string, letra: string) => sep + letra.toLocaleUpperCase("pt-BR")),
    )
    .join(" ");
}

/** Perguntas de texto curto que pedem um nome de pessoa (o próprio, do pastor, do responsável...). */
export const ehPerguntaDeNome = (p: Pick<PerguntaPublica, "tipo" | "label">) => p.tipo === "TEXTO_CURTO" && /\bnome\b/i.test(p.label);

export function cpfValido(value: string) {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (len: number) => {
    let soma = 0;
    for (let i = 0; i < len; i++) soma += Number(cpf[i]) * (len + 1 - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(9) === Number(cpf[9]) && digito(10) === Number(cpf[10]);
}

export function formatCpf(value: string) {
  const d = onlyDigits(value).slice(0, 11);
  return d.replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** Remove o código do país (+55) quando a pessoa digita o número completo. */
function semCodigoPais(digitos: string) {
  return digitos.length > 11 && digitos.startsWith("55") ? digitos.slice(2) : digitos;
}

export function formatTelefone(value: string) {
  const d = semCodigoPais(onlyDigits(value)).slice(0, 11);
  if (d.length <= 2) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

export interface RegrasInscricao {
  /** idade mínima na data de início do evento */
  idadeMinima?: number | null;
  /** data usada para calcular a idade (início do evento), em ISO */
  dataReferencia?: string | null;
}

/** Pergunta de data cujo texto fala de nascimento — usada na checagem de idade mínima. */
export const ehDataNascimento = (p: Pick<PerguntaPublica, "tipo" | "label">) => p.tipo === "DATA" && /nasc/i.test(p.label);

export function idadeEm(nascimentoIso: string, referencia: Date) {
  const [ano, mes, dia] = nascimentoIso.split("-").map(Number);
  let idade = referencia.getUTCFullYear() - ano;
  const mesRef = referencia.getUTCMonth() + 1;
  if (mesRef < mes || (mesRef === mes && referencia.getUTCDate() < dia)) idade--;
  return idade;
}

function validarUma(pergunta: PerguntaPublica, valor: ValorResposta | undefined, regras: RegrasInscricao): string | null {
  const vazio = valor == null || (Array.isArray(valor) ? valor.length === 0 : valor.trim() === "");
  if (vazio) return pergunta.obrigatoria ? "Resposta obrigatória." : null;

  if (Array.isArray(valor)) {
    if (pergunta.tipo !== "MULTIPLA_ESCOLHA") return "Resposta inválida.";
    return valor.every((v) => pergunta.opcoes.includes(v)) ? null : "Escolha entre as opções disponíveis.";
  }

  const v = valor.trim();
  switch (pergunta.tipo) {
    case "EMAIL":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Informe um e-mail válido.";
    case "CPF":
      return cpfValido(v) ? null : "CPF inválido. Confira os números.";
    case "TELEFONE":
      return [10, 11].includes(semCodigoPais(onlyDigits(v)).length) ? null : "Informe o telefone com DDD.";
    case "DATA": {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return "Informe uma data válida.";
      const data = new Date(`${v}T12:00:00Z`);
      if (Number.isNaN(data.getTime()) || data > new Date() || data.getUTCFullYear() < 1900) return "Informe uma data válida.";
      if (regras.idadeMinima && regras.dataReferencia && ehDataNascimento(pergunta)) {
        const idade = idadeEm(v, new Date(regras.dataReferencia));
        if (idade < regras.idadeMinima) return `A idade mínima para participar é ${regras.idadeMinima} anos na data do evento.`;
      }
      return null;
    }
    case "ESCOLHA_UNICA":
      return pergunta.opcoes.includes(v) ? null : "Escolha uma das opções.";
    case "MULTIPLA_ESCOLHA":
      return "Resposta inválida.";
    default:
      return v.length > (pergunta.tipo === "PARAGRAFO" ? 3000 : 300) ? "Resposta muito longa." : null;
  }
}

/**
 * Uma pergunta condicional só aparece quando a pergunta "pai" tem a resposta esperada.
 * `todas` é a lista completa do evento (o pai pode estar em outra etapa).
 */
export function perguntaVisivel(pergunta: PerguntaPublica, todas: PerguntaPublica[], brutas: RespostasBrutas): boolean {
  if (!pergunta.condicaoChave) return true;
  const pai = todas.find((p) => (p.chave ?? p.id) === pergunta.condicaoChave);
  if (!pai || !perguntaVisivel(pai, todas, brutas)) return false;
  const valor = brutas[pai.id];
  return Array.isArray(valor) ? valor.includes(pergunta.condicaoValor ?? "") : valor === pergunta.condicaoValor;
}

export function validarRespostas(
  perguntas: PerguntaPublica[],
  brutas: RespostasBrutas,
  regras: RegrasInscricao = {},
  todas: PerguntaPublica[] = perguntas,
) {
  const erros: Record<string, string> = {};
  const respostas: RespostaSalva[] = [];

  for (const pergunta of perguntas) {
    // perguntas escondidas por condição não são exigidas nem salvas
    if (!perguntaVisivel(pergunta, todas, brutas)) continue;
    const valor = brutas[pergunta.id];
    const erro = validarUma(pergunta, valor, regras);
    if (erro) {
      erros[pergunta.id] = erro;
      continue;
    }
    let normalizado: ValorResposta = Array.isArray(valor) ? valor : (valor ?? "").trim();
    if (typeof normalizado === "string") {
      if (pergunta.tipo === "CPF") normalizado = formatCpf(normalizado);
      if (pergunta.tipo === "TELEFONE") normalizado = formatTelefone(normalizado);
      if (pergunta.tipo === "EMAIL") normalizado = normalizado.toLowerCase();
      if (ehPerguntaDeNome(pergunta)) normalizado = formatarNome(normalizado);
    }
    respostas.push({ label: pergunta.label, tipo: pergunta.tipo, valor: normalizado });
  }

  return { erros, respostas, ok: Object.keys(erros).length === 0 };
}

/** Puxa nome, e-mail, CPF e telefone das respostas para facilitar busca e controle de duplicidade. */
export function extrairIdentificacao(respostas: RespostaSalva[]) {
  const texto = (r?: RespostaSalva) => (r && typeof r.valor === "string" && r.valor ? r.valor : null);
  return {
    nome: texto(respostas.find((r) => r.tipo === "TEXTO_CURTO" && /nome/i.test(r.label) && !/pastor|respons/i.test(r.label))),
    email: texto(respostas.find((r) => r.tipo === "EMAIL")),
    cpf: texto(respostas.find((r) => r.tipo === "CPF")),
    telefone: texto(respostas.find((r) => r.tipo === "TELEFONE")),
  };
}

/* ---------- etapas do formulário ---------- */

export interface Etapa {
  titulo: string;
  perguntas: PerguntaPublica[];
}

/**
 * Agrupa perguntas seguidas com a mesma seção em uma etapa.
 * Sem nenhuma seção definida, divide em blocos de 5 perguntas.
 */
export function montarEtapas(perguntas: PerguntaPublica[]): Etapa[] {
  const temSecoes = perguntas.some((p) => p.secao?.trim());
  if (!temSecoes) {
    const etapas: Etapa[] = [];
    for (let i = 0; i < perguntas.length; i += 5) {
      etapas.push({ titulo: perguntas.length > 5 ? `Parte ${etapas.length + 1}` : "Suas respostas", perguntas: perguntas.slice(i, i + 5) });
    }
    return etapas;
  }
  const etapas: Etapa[] = [];
  for (const pergunta of perguntas) {
    const titulo = pergunta.secao?.trim() || etapas.at(-1)?.titulo || "Suas respostas";
    const atual = etapas.at(-1);
    if (atual && atual.titulo === titulo) atual.perguntas.push(pergunta);
    else etapas.push({ titulo, perguntas: [pergunta] });
  }
  return etapas;
}

/** Soma dias úteis (seg–sex) a uma data. */
export function somarDiasUteis(inicio: Date, dias: number) {
  const data = new Date(inicio);
  let restantes = dias;
  while (restantes > 0) {
    data.setDate(data.getDate() + 1);
    const dia = data.getDay();
    if (dia !== 0 && dia !== 6) restantes--;
  }
  return data;
}
