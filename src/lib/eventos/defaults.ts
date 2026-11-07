import type { EventoFormValues, PerguntaForm } from "./schema";

const SOBRE = "Sobre você";
const IGREJA = "Igreja e experiência";
const CAMISA = "Camisa e dúvidas";

type PerguntaBase = Omit<PerguntaForm, "condicaoChave" | "condicaoValor" | "ajuda" | "opcoes"> &
  Partial<Pick<PerguntaForm, "condicaoChave" | "condicaoValor" | "ajuda" | "opcoes">>;

const pergunta = (p: PerguntaBase): PerguntaForm => ({ ajuda: "", opcoes: [], condicaoChave: "", condicaoValor: "", ...p });

/**
 * Perguntas padrão da inscrição, baseadas no formulário do Google usado na 12ª edição,
 * agrupadas em seções (cada seção vira uma etapa do formulário no site).
 * A camisa extra virou "Sim/Não" e só pede tipo e tamanho para quem marca "Sim".
 * Todo evento novo começa com esta lista; dá para editar, reordenar e remover no passo "Inscrição".
 */
export const perguntasPadrao: PerguntaForm[] = [
  pergunta({ chave: "email", secao: SOBRE, label: "E-mail", tipo: "EMAIL", obrigatoria: true }),
  pergunta({ chave: "nome", secao: SOBRE, label: "Nome completo", tipo: "TEXTO_CURTO", obrigatoria: true }),
  pergunta({ chave: "nascimento", secao: SOBRE, label: "Data de nascimento", tipo: "DATA", obrigatoria: true }),
  pergunta({ chave: "telefone", secao: SOBRE, label: "Número do telefone (WhatsApp)", tipo: "TELEFONE", obrigatoria: true }),
  pergunta({ chave: "cpf", secao: SOBRE, label: "CPF", tipo: "CPF", obrigatoria: true }),
  pergunta({
    chave: "responsavel_nome",
    secao: SOBRE,
    label: "Nome do responsável",
    tipo: "TEXTO_CURTO",
    obrigatoria: true,
    ajuda: "Pessoa para contato em caso de emergência (pai, mãe, cônjuge...).",
  }),
  pergunta({ chave: "responsavel_telefone", secao: SOBRE, label: "Telefone do responsável", tipo: "TELEFONE", obrigatoria: true }),
  pergunta({ chave: "igreja", secao: IGREJA, label: "Qual igreja você congrega? Qual estado?", tipo: "TEXTO_CURTO", obrigatoria: true }),
  pergunta({ chave: "pastor", secao: IGREJA, label: "Nome do pastor", tipo: "TEXTO_CURTO", obrigatoria: true }),
  pergunta({ chave: "pastor_telefone", secao: IGREJA, label: "Telefone do pastor", tipo: "TELEFONE", obrigatoria: true }),
  pergunta({
    chave: "area_igreja",
    secao: IGREJA,
    label: "Está envolvido em alguma área de atuação na igreja? Qual?",
    tipo: "TEXTO_CURTO",
    obrigatoria: true,
    ajuda: "Ex.: departamento infantil, louvor...",
  }),
  pergunta({
    chave: "experiencia_missoes",
    secao: IGREJA,
    label: "Você já participou de trabalhos missionários?",
    tipo: "ESCOLHA_UNICA",
    obrigatoria: true,
    opcoes: [
      "Sim, participei de poucos.",
      "Sim, sou totalmente envolvido, tenho conhecimento e prática.",
      "Não, tenho conhecimento sobre o assunto mas é a primeira vivência que vou ter.",
      "Não, vai ser minha primeira oportunidade de aprender e colocar em prática.",
    ],
  }),
  pergunta({
    chave: "experiencia_relato",
    secao: IGREJA,
    label: "Se já participou de um trabalho evangelístico, conte-nos a sua experiência.",
    tipo: "PARAGRAFO",
    obrigatoria: false,
  }),
  pergunta({ chave: "camisa", secao: CAMISA, label: "Tamanho da camisa", tipo: "ESCOLHA_UNICA", obrigatoria: true, opcoes: ["PP", "P", "M", "G", "GG", "XL"] }),
  pergunta({ chave: "camisa_extra", secao: CAMISA, label: "Quer uma camisa extra?", tipo: "ESCOLHA_UNICA", obrigatoria: true, opcoes: ["Sim", "Não"] }),
  pergunta({
    chave: "camisa_extra_tipo",
    secao: CAMISA,
    label: "Tipo da camisa extra",
    tipo: "ESCOLHA_UNICA",
    obrigatoria: true,
    opcoes: ["Manga normal — R$ 54,00", "Manga comprida — R$ 64,00"],
    ajuda: "O valor é pago junto com a inscrição.",
    condicaoChave: "camisa_extra",
    condicaoValor: "Sim",
  }),
  pergunta({
    chave: "camisa_extra_tamanho",
    secao: CAMISA,
    label: "Tamanho da camisa extra",
    tipo: "ESCOLHA_UNICA",
    obrigatoria: true,
    opcoes: ["PP", "P", "M", "G", "GG", "XL"],
    ajuda: "Quer mais de uma? Conte pra gente no campo de dúvidas abaixo.",
    condicaoChave: "camisa_extra",
    condicaoValor: "Sim",
  }),
  pergunta({ chave: "duvidas", secao: CAMISA, label: "Perguntas / dúvidas?", tipo: "PARAGRAFO", obrigatoria: false }),
];

export const checklistPadrao = [
  "Bíblia, caneta e caderno de anotações",
  "Documento de identificação oficial com foto (identidade, carteira de motorista ou outro)",
  "Cartão do SUS e de vacina",
  "Duas peças de roupa jeans (calça) e calças pantalonas/folgadas e confortáveis (F); não é permitido short cotton, camisolas ou peças íntimas inadequadas para dormir",
  "Saias longas ou até os joelhos, bermudas (M/F) — observe as vestimentas adequadas para o projeto",
  "Remédios de uso contínuo ou prolongado",
  "Protetor solar, repelente e protetor labial de uso pessoal",
  "Copo, prato e talheres (aconselhado de plástico)",
  "Colchonete, colchão de ar ou rede, dois lençóis e toalhas",
  "Sabão de lavar roupa, material de higiene pessoal, varal, prendedores e lanterna",
  "Uma chinela tipo havaiana e tênis",
  "Músicos: se possível, levem seus instrumentos para os louvores no evangelismo",
  "Departamento infantil: levem materiais para o evangelismo infantil",
].join("\n");

export function emptyEvento(): EventoFormValues {
  return {
    nome: "",
    subtitulo: "",
    edicao: "",
    tipo: "VIAGEM_MISSIONARIA",
    status: "RASCUNHO",
    destaque: false,
    resumo: "",
    sobre: "",
    dataInicio: "",
    dataFim: "",
    inscricaoInicio: "",
    inscricaoFim: "",
    vagas: "",
    idadeMinima: "16",
    requisitos: "Estar em comunhão com o seu pastor e a sua igreja.",
    imagemUrl: "",
    videoUrl: "",
    valorInscricao: "",
    valorPreInscricao: "",
    prazoPreInscricaoDias: "",
    informacoesPagamento: "",
    politicaCancelamento: "Em caso de desistência não haverá reembolso.",
    checklist: checklistPadrao,
    locais: [],
    programacao: [],
    perguntas: perguntasPadrao.map((p) => ({ ...p, opcoes: [...p.opcoes] })),
    contatos: [{ nome: "WhatsApp da missão", funcao: "Secretaria", telefone: "(81) 99333-6981", whatsapp: true }],
  };
}
