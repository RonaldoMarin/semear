import type { StatusEvento, TipoEvento, TipoPergunta } from "@prisma/client";

export const tipoEventoLabel: Record<TipoEvento, string> = {
  VIAGEM_MISSIONARIA: "Viagem missionária",
  TREINAMENTO: "Treinamento",
  ENCONTRO: "Encontro",
  EVANGELISMO: "Evangelismo",
  ARRECADACAO: "Arrecadação",
  OUTRO: "Outro",
};

export const statusEventoLabel: Record<StatusEvento, string> = {
  RASCUNHO: "Rascunho",
  EM_BREVE: "Em breve",
  INSCRICOES_ABERTAS: "Inscrições abertas",
  INSCRICOES_ENCERRADAS: "Inscrições encerradas",
  REALIZADO: "Realizado",
  CANCELADO: "Cancelado",
};

export const statusEventoDescricao: Record<StatusEvento, string> = {
  RASCUNHO: "Visível só no painel.",
  EM_BREVE: "Aparece no site, sem inscrições.",
  INSCRICOES_ABERTAS: "Aparece no site recebendo inscrições.",
  INSCRICOES_ENCERRADAS: "Aparece no site, inscrições fechadas.",
  REALIZADO: "Evento já aconteceu.",
  CANCELADO: "Evento cancelado.",
};

export const tipoPerguntaLabel: Record<TipoPergunta, string> = {
  TEXTO_CURTO: "Texto curto",
  PARAGRAFO: "Parágrafo",
  EMAIL: "E-mail",
  TELEFONE: "Telefone",
  CPF: "CPF",
  DATA: "Data",
  ESCOLHA_UNICA: "Escolha única",
  MULTIPLA_ESCOLHA: "Várias opções",
};

export const tiposComOpcoes: TipoPergunta[] = ["ESCOLHA_UNICA", "MULTIPLA_ESCOLHA"];
