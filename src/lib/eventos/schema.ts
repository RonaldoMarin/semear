import { z } from "zod";
import { fromLocalInput, parseMoney } from "./format";

/* Valores do formulário de evento: tudo em string, como vem dos inputs.
   Este arquivo é usado no navegador (validação por passo) e no servidor (validação final). */

const tipos = ["VIAGEM_MISSIONARIA", "TREINAMENTO", "ENCONTRO", "EVANGELISMO", "ARRECADACAO", "OUTRO"] as const;
const status = ["RASCUNHO", "EM_BREVE", "INSCRICOES_ABERTAS", "INSCRICOES_ENCERRADAS", "REALIZADO", "CANCELADO"] as const;
const tiposPergunta = ["TEXTO_CURTO", "PARAGRAFO", "EMAIL", "TELEFONE", "CPF", "DATA", "ESCOLHA_UNICA", "MULTIPLA_ESCOLHA"] as const;

const texto = (max: number) => z.string().trim().max(max, `Use no máximo ${max} caracteres.`);
const obrigatorio = (max: number, msg = "Campo obrigatório.") => texto(max).min(1, msg);
const dataLocal = z.string().regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, "Informe data e hora.");
const dataLocalOpcional = z.union([z.literal(""), dataLocal]);
const inteiroOpcional = (min: number, msg: string) =>
  z.string().trim().refine((v) => v === "" || (/^\d+$/.test(v) && Number(v) >= min), msg);
const dinheiroOpcional = z
  .string()
  .trim()
  .refine((v) => v === "" || Number.isFinite(parseMoney(v) ?? 0), "Valor inválido. Ex.: 450,00");
const urlOpcional = z.string().trim().refine((v) => v === "" || /^(https?:\/\/|\/)/.test(v), "Use um link começando com https://");

export const localSchema = z.object({
  etapa: texto(60),
  nome: obrigatorio(160, "Informe o nome do local."),
  endereco: texto(240),
  cidade: texto(100),
  uf: texto(2),
});

export const programacaoSchema = z
  .object({
    titulo: obrigatorio(200, "Informe o título."),
    inicio: dataLocal,
    fim: dataLocalOpcional,
    descricao: texto(1000),
  })
  .refine((v) => !v.fim || v.fim >= v.inicio, { path: ["fim"], message: "O fim deve ser depois do início." });

export const perguntaSchema = z
  .object({
    chave: z.string().trim().min(1).max(40),
    secao: texto(80),
    condicaoChave: texto(40),
    condicaoValor: texto(200),
    label: obrigatorio(300, "Escreva a pergunta."),
    ajuda: texto(500),
    tipo: z.enum(tiposPergunta),
    opcoes: z.array(texto(200)),
    obrigatoria: z.boolean(),
  })
  .refine((v) => !["ESCOLHA_UNICA", "MULTIPLA_ESCOLHA"].includes(v.tipo) || v.opcoes.filter(Boolean).length >= 2, {
    path: ["opcoes"],
    message: "Adicione pelo menos duas opções.",
  });

export const contatoSchema = z.object({
  nome: obrigatorio(120, "Informe o nome."),
  funcao: texto(80),
  telefone: obrigatorio(30, "Informe o telefone."),
  whatsapp: z.boolean(),
});

export const eventoSchema = z
  .object({
    nome: obrigatorio(200, "Dê um nome ao evento."),
    subtitulo: texto(200),
    edicao: texto(60),
    tipo: z.enum(tipos),
    status: z.enum(status),
    destaque: z.boolean(),
    resumo: texto(500),
    sobre: texto(10000),

    dataInicio: dataLocal,
    dataFim: dataLocal,
    inscricaoInicio: dataLocalOpcional,
    inscricaoFim: dataLocalOpcional,
    vagas: inteiroOpcional(1, "Informe um número a partir de 1."),
    idadeMinima: inteiroOpcional(0, "Informe uma idade válida."),
    requisitos: texto(1000),

    imagemUrl: urlOpcional,
    videoUrl: urlOpcional,

    valorInscricao: dinheiroOpcional,
    valorPreInscricao: dinheiroOpcional,
    prazoPreInscricaoDias: inteiroOpcional(1, "Informe um número de dias."),
    informacoesPagamento: texto(3000),
    politicaCancelamento: texto(1000),

    checklist: texto(5000),
    locais: z.array(localSchema).max(10),
    programacao: z.array(programacaoSchema).max(100),
    perguntas: z.array(perguntaSchema).max(60),
    contatos: z.array(contatoSchema).max(10),
  })
  .superRefine((v, ctx) => {
    if (v.dataInicio && v.dataFim && v.dataFim < v.dataInicio) {
      ctx.addIssue({ code: "custom", path: ["dataFim"], message: "O término deve ser depois do início." });
    }
    if (v.inscricaoInicio && v.inscricaoFim && v.inscricaoFim < v.inscricaoInicio) {
      ctx.addIssue({ code: "custom", path: ["inscricaoFim"], message: "O fim das inscrições deve ser depois do início." });
    }
    if (v.inscricaoFim && v.dataInicio && v.inscricaoFim > v.dataInicio) {
      ctx.addIssue({ code: "custom", path: ["inscricaoFim"], message: "As inscrições devem fechar antes do evento começar." });
    }
    const total = parseMoney(v.valorInscricao);
    const pre = parseMoney(v.valorPreInscricao);
    if (total != null && pre != null && pre > total) {
      ctx.addIssue({ code: "custom", path: ["valorPreInscricao"], message: "A pré-inscrição não pode passar do valor total." });
    }
    // perguntas condicionais: a pergunta "pai" precisa vir antes, ser de escolha e ter a opção escolhida
    const chaves = new Set<string>();
    v.perguntas.forEach((p, i) => {
      if (chaves.has(p.chave)) ctx.addIssue({ code: "custom", path: ["perguntas", i, "label"], message: "Pergunta duplicada. Remova e adicione de novo." });
      if (p.condicaoChave) {
        const pai = v.perguntas.slice(0, i).find((anterior) => anterior.chave === p.condicaoChave);
        if (!pai || !["ESCOLHA_UNICA", "MULTIPLA_ESCOLHA"].includes(pai.tipo)) {
          ctx.addIssue({ code: "custom", path: ["perguntas", i, "condicaoChave"], message: "A condição precisa usar uma pergunta de escolha que venha antes desta." });
        } else if (!p.condicaoValor || !pai.opcoes.includes(p.condicaoValor)) {
          ctx.addIssue({ code: "custom", path: ["perguntas", i, "condicaoValor"], message: "Escolha qual resposta libera esta pergunta." });
        }
      }
      chaves.add(p.chave);
    });

    if (v.status === "INSCRICOES_ABERTAS" && v.perguntas.length === 0) {
      ctx.addIssue({ code: "custom", path: ["perguntas"], message: "Para abrir inscrições, adicione pelo menos uma pergunta." });
    }
  });

export type EventoFormValues = z.input<typeof eventoSchema>;
export type LocalForm = z.input<typeof localSchema>;
export type ProgramacaoForm = z.input<typeof programacaoSchema>;
export type PerguntaForm = z.input<typeof perguntaSchema>;
export type ContatoForm = z.input<typeof contatoSchema>;

/** Erros achatados por caminho: "dataFim", "perguntas.3.opcoes"... */
export type FieldErrors = Record<string, string>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}

/* ---------- passos do assistente ---------- */

export const passos = [
  { id: "geral", titulo: "Dados gerais", descricao: "Nome, tipo e apresentação", campos: ["nome", "subtitulo", "edicao", "tipo", "status", "destaque", "resumo", "sobre"] },
  { id: "datas", titulo: "Datas e vagas", descricao: "Período, inscrições e requisitos", campos: ["dataInicio", "dataFim", "inscricaoInicio", "inscricaoFim", "vagas", "idadeMinima", "requisitos"] },
  { id: "local", titulo: "Local e mídia", descricao: "Onde acontece, imagem e vídeo", campos: ["locais", "imagemUrl", "videoUrl"] },
  { id: "valores", titulo: "Valores", descricao: "Taxa, pré-inscrição e pagamento", campos: ["valorInscricao", "valorPreInscricao", "prazoPreInscricaoDias", "informacoesPagamento", "politicaCancelamento"] },
  { id: "programacao", titulo: "Programação", descricao: "Cronograma do evento", campos: ["programacao"] },
  { id: "inscricao", titulo: "Inscrição", descricao: "Perguntas do formulário", campos: ["perguntas"] },
  { id: "contatos", titulo: "Contatos e check-list", descricao: "Secretaria e o que levar", campos: ["contatos", "checklist"] },
  { id: "revisao", titulo: "Revisão", descricao: "Confira e salve", campos: [] },
] as const;

export type PassoId = (typeof passos)[number]["id"];

export function errorsForStep(errors: FieldErrors, passo: (typeof passos)[number]) {
  return Object.keys(errors).filter((key) => (passo.campos as readonly string[]).includes(key.split(".")[0]));
}

/* ---------- conversão para o banco (servidor) ---------- */

const nullIfEmpty = (v: string) => (v.trim() === "" ? null : v.trim());
const intOrNull = (v: string) => (v.trim() === "" ? null : Number(v));

export function toDatabase(data: z.output<typeof eventoSchema>) {
  return {
    nome: data.nome,
    subtitulo: nullIfEmpty(data.subtitulo),
    edicao: nullIfEmpty(data.edicao),
    tipo: data.tipo,
    status: data.status,
    destaque: data.destaque,
    resumo: nullIfEmpty(data.resumo),
    sobre: nullIfEmpty(data.sobre),
    dataInicio: fromLocalInput(data.dataInicio),
    dataFim: fromLocalInput(data.dataFim),
    inscricaoInicio: data.inscricaoInicio ? fromLocalInput(data.inscricaoInicio) : null,
    inscricaoFim: data.inscricaoFim ? fromLocalInput(data.inscricaoFim) : null,
    vagas: intOrNull(data.vagas),
    idadeMinima: intOrNull(data.idadeMinima),
    requisitos: nullIfEmpty(data.requisitos),
    imagemUrl: nullIfEmpty(data.imagemUrl),
    videoUrl: nullIfEmpty(data.videoUrl),
    valorInscricaoCentavos: parseMoney(data.valorInscricao),
    valorPreInscricaoCentavos: parseMoney(data.valorPreInscricao),
    prazoPreInscricaoDias: intOrNull(data.prazoPreInscricaoDias),
    informacoesPagamento: nullIfEmpty(data.informacoesPagamento),
    politicaCancelamento: nullIfEmpty(data.politicaCancelamento),
    checklist: nullIfEmpty(data.checklist),
    locais: data.locais.map((l, ordem) => ({
      etapa: nullIfEmpty(l.etapa),
      nome: l.nome,
      endereco: nullIfEmpty(l.endereco),
      cidade: nullIfEmpty(l.cidade),
      uf: nullIfEmpty(l.uf.toUpperCase()),
      ordem,
    })),
    programacao: data.programacao.map((p, ordem) => ({
      titulo: p.titulo,
      inicio: fromLocalInput(p.inicio),
      fim: p.fim ? fromLocalInput(p.fim) : null,
      descricao: nullIfEmpty(p.descricao),
      ordem,
    })),
    perguntas: data.perguntas.map((p, ordem) => ({
      chave: p.chave,
      secao: nullIfEmpty(p.secao),
      condicaoChave: nullIfEmpty(p.condicaoChave),
      condicaoValor: p.condicaoChave ? nullIfEmpty(p.condicaoValor) : null,
      label: p.label,
      ajuda: nullIfEmpty(p.ajuda),
      tipo: p.tipo,
      opcoes: ["ESCOLHA_UNICA", "MULTIPLA_ESCOLHA"].includes(p.tipo) ? p.opcoes.map((o) => o.trim()).filter(Boolean) : [],
      obrigatoria: p.obrigatoria,
      ordem,
    })),
    contatos: data.contatos.map((c, ordem) => ({
      nome: c.nome,
      funcao: nullIfEmpty(c.funcao),
      telefone: c.telefone,
      whatsapp: c.whatsapp,
      ordem,
    })),
  };
}
