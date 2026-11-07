import "server-only";
import { formatDate, formatDateRange, formatMoney } from "@/lib/eventos/format";
import { somarDiasUteis } from "@/lib/inscricoes/validacao";
import { botao, contatos, destaque, esc, infos, lista, moldura, multilinha, paragrafo, passos, subtitulo, titulo } from "./layout";

export interface EmailPronto {
  assunto: string;
  html: string;
  texto: string;
}

export interface EventoEmail {
  nome: string;
  slug: string;
  edicao: string | null;
  dataInicio: Date;
  dataFim: Date;
  locais: { etapa: string | null; nome: string; endereco: string | null; cidade: string | null; uf: string | null }[];
  valorInscricaoCentavos: number | null;
  valorPreInscricaoCentavos: number | null;
  prazoPreInscricaoDias: number | null;
  informacoesPagamento: string | null;
  politicaCancelamento: string | null;
  checklist: string | null;
  contatos: { nome: string; funcao: string | null; telefone: string; whatsapp: boolean }[];
}

const primeiroNome = (nome: string | null) => nome?.trim().split(/\s+/)[0] ?? "";
const saudacao = (nome: string | null) => (primeiroNome(nome) ? `Olá, ${primeiroNome(nome)}!` : "Olá!");
/** versão para HTML: o nome vem do formulário público, então é escapado */
const saudacaoHtml = (nome: string | null) => esc(saudacao(nome));

function textoLocais(evento: EventoEmail) {
  return evento.locais
    .map((l) => `${l.etapa ? `${l.etapa}: ` : ""}${l.nome}${l.cidade ? ` — ${[l.cidade, l.uf].filter(Boolean).join("/")}` : ""}`)
    .join("\n");
}

function textoPlano(linhas: (string | null | undefined | false)[]) {
  return linhas.filter((l): l is string => typeof l === "string").join("\n");
}

/* ---------- inscrição recebida ---------- */

export function emailInscricaoRecebida({
  evento,
  nome,
  protocolo,
  urlEvento,
  vagaLiberada = false,
}: {
  evento: EventoEmail;
  nome: string | null;
  protocolo: string;
  urlEvento: string;
  /** a pessoa saiu da lista de espera: mesmo conteúdo, com outro título e introdução */
  vagaLiberada?: boolean;
}): EmailPronto {
  const total = evento.valorInscricaoCentavos;
  const pre = evento.valorPreInscricaoCentavos;
  const restante = total != null && pre != null ? total - pre : null;
  const prazo = evento.prazoPreInscricaoDias ? somarDiasUteis(new Date(), evento.prazoPreInscricaoDias) : null;
  const prazoTexto = prazo ? formatDate(prazo, { weekday: "long", day: "2-digit", month: "long" }) : null;

  const valorTexto =
    total != null
      ? [formatMoney(total), pre != null ? `Pré-inscrição: ${formatMoney(pre)}` : null, restante && restante > 0 ? `Restante: ${formatMoney(restante)}` : null]
          .filter(Boolean)
          .join("\n")
      : "Gratuito";

  const etapas = [
    ...(pre != null
      ? [
          {
            titulo: `Pague a pré-inscrição de ${formatMoney(pre)}`,
            texto: prazoTexto ? `Até <strong>${prazoTexto}</strong>. Sem o pagamento nesse prazo, a inscrição pode ser cancelada.` : "Use os dados de pagamento abaixo.",
          },
        ]
      : []),
    { titulo: "Envie o comprovante para a secretaria", texto: `Pelo WhatsApp, informando seu protocolo <strong>${protocolo}</strong>.` },
    {
      titulo: "Reunião de entrevista",
      texto: "Em breve a coordenação vai entrar em contato pelo seu WhatsApp ou e-mail para agendar uma conversa rápida com você. É um momento para nos conhecermos melhor e tirar dúvidas sobre a missão.",
    },
    { titulo: "Aguarde a confirmação", texto: "Depois do pagamento e da entrevista, você recebe um e-mail confirmando sua vaga." },
  ];

  const html = moldura({
    preheader: vagaLiberada ? `Uma vaga abriu em ${evento.nome}! Veja como garantir a sua.` : `Recebemos sua inscrição em ${evento.nome}. Protocolo ${protocolo}.`,
    conteudo: [
      titulo(vagaLiberada ? "Uma vaga abriu para você!" : "Inscrição recebida!", evento.edicao ?? "Inscrições"),
      paragrafo(
        vagaLiberada
          ? `${saudacaoHtml(nome)} Boa notícia: uma vaga foi liberada em <strong style="color:#34281f">${multilinha(evento.nome)}</strong> e ela é sua! Você saiu da lista de espera. Agora siga os passos abaixo para garantir sua participação.`
          : `${saudacaoHtml(nome)} Que alegria ter você caminhando com a gente. Recebemos sua inscrição em <strong style="color:#34281f">${multilinha(evento.nome)}</strong>.`,
      ),
      destaque({ rotulo: "Seu protocolo", valor: protocolo }),
      infos([
        { rotulo: "Quando", valor: formatDateRange(evento.dataInicio, evento.dataFim) },
        { rotulo: "Onde", valor: textoLocais(evento) },
        { rotulo: "Investimento", valor: valorTexto },
      ]),
      subtitulo("Próximos passos"),
      passos(etapas),
      evento.informacoesPagamento ? subtitulo("Dados para pagamento") + paragrafo(multilinha(evento.informacoesPagamento)) : "",
      evento.politicaCancelamento ? paragrafo(`<em>${multilinha(evento.politicaCancelamento)}</em>`) : "",
      contatos(evento.contatos),
      botao("Ver detalhes do evento", urlEvento),
    ].join(""),
  });

  const texto = textoPlano([
    `${saudacao(nome)} Recebemos sua inscrição em ${evento.nome}.`,
    `Protocolo: ${protocolo}`,
    "",
    `Quando: ${formatDateRange(evento.dataInicio, evento.dataFim)}`,
    evento.locais.length ? `Onde: ${textoLocais(evento).replace(/\n/g, "; ")}` : null,
    `Investimento: ${valorTexto.replace(/\n/g, " · ")}`,
    "",
    "Próximos passos:",
    ...etapas.map((e, i) => `${i + 1}. ${e.titulo} — ${e.texto.replace(/<[^>]+>/g, "")}`),
    evento.informacoesPagamento ? `\nDados para pagamento:\n${evento.informacoesPagamento}` : null,
    evento.contatos.length ? `\nSecretaria: ${evento.contatos.map((c) => `${c.nome} ${c.telefone}`).join(" · ")}` : null,
    "",
    `Detalhes: ${urlEvento}`,
  ]);

  return {
    assunto: vagaLiberada ? `Uma vaga abriu para você · ${evento.nome}` : `Inscrição recebida · ${evento.nome} (protocolo ${protocolo})`,
    html,
    texto: vagaLiberada ? texto.replace(/^.*?\n/, `${saudacao(nome)} Uma vaga abriu em ${evento.nome} e ela é sua!\n`) : texto,
  };
}

/* ---------- lista de espera ---------- */

export function emailListaEspera({
  evento,
  nome,
  protocolo,
  posicao,
  urlEvento,
}: {
  evento: EventoEmail;
  nome: string | null;
  protocolo: string;
  posicao: number;
  urlEvento: string;
}): EmailPronto {
  const html = moldura({
    preheader: `Você é o ${posicao}º da lista de espera de ${evento.nome}.`,
    conteudo: [
      titulo("Você está na lista de espera", evento.edicao ?? "Lista de espera"),
      paragrafo(
        `${saudacaoHtml(nome)} As vagas de <strong style="color:#34281f">${multilinha(evento.nome)}</strong> foram preenchidas, mas sua inscrição ficou guardada na nossa lista de espera. <strong style="color:#34281f">Não é preciso pagar nada agora.</strong>`,
      ),
      destaque({ rotulo: "Sua posição na fila", valor: `${posicao}º · protocolo ${protocolo}`, tom: "folha" }),
      infos([
        { rotulo: "Quando", valor: formatDateRange(evento.dataInicio, evento.dataFim) },
        { rotulo: "Onde", valor: textoLocais(evento) },
      ]),
      subtitulo("Como funciona a lista de espera"),
      passos([
        { titulo: "Aguarde nosso contato", texto: "Se alguém desistir, a secretaria chama as pessoas da lista seguindo a ordem da fila." },
        {
          titulo: "Vaga liberada? Aí sim, o pagamento",
          texto: "Quando a sua vez chegar, você recebe um e-mail com as instruções de pagamento da pré-inscrição e o prazo para garantir a vaga.",
        },
        { titulo: "Enquanto isso, ore com a gente", texto: "A missão acontece também por meio de quem intercede pelas equipes e pelas comunidades." },
      ]),
      contatos(evento.contatos),
      botao("Ver detalhes do evento", urlEvento, "terra"),
    ].join(""),
  });

  const texto = textoPlano([
    `${saudacao(nome)} As vagas de ${evento.nome} foram preenchidas, mas você está na lista de espera.`,
    `Sua posição na fila: ${posicao}º · protocolo ${protocolo}`,
    "Não é preciso pagar nada agora. Se uma vaga abrir, a secretaria entra em contato seguindo a ordem da fila, com as instruções de pagamento.",
    "",
    `Detalhes: ${urlEvento}`,
  ]);

  return { assunto: `Lista de espera · ${evento.nome} (${posicao}º na fila)`, html, texto };
}

/* ---------- inscrição confirmada ---------- */

export function emailInscricaoConfirmada({
  evento,
  nome,
  protocolo,
  urlEvento,
}: {
  evento: EventoEmail;
  nome: string | null;
  protocolo: string;
  urlEvento: string;
}): EmailPronto {
  const checklist = (evento.checklist ?? "")
    .split("\n")
    .map((i) => i.trim())
    .filter(Boolean);
  const diasParaComecar = Math.ceil((evento.dataInicio.getTime() - Date.now()) / 86_400_000);

  const html = moldura({
    preheader: `Sua vaga em ${evento.nome} está confirmada!`,
    conteudo: [
      titulo("Sua vaga está confirmada!", evento.edicao ?? "Inscrição confirmada"),
      paragrafo(
        `${saudacaoHtml(nome)} Recebemos e conferimos seu pagamento. Sua participação em <strong style="color:#34281f">${multilinha(evento.nome)}</strong> está garantida. Agora é só se preparar e orar com a gente por cada comunidade que vamos alcançar.`,
      ),
      destaque({ rotulo: diasParaComecar > 0 ? `Faltam ${diasParaComecar} dias` : "Protocolo", valor: diasParaComecar > 0 ? formatDate(evento.dataInicio, { day: "2-digit", month: "long" }) : protocolo, tom: "folha" }),
      infos([
        { rotulo: "Quando", valor: formatDateRange(evento.dataInicio, evento.dataFim) },
        { rotulo: "Onde", valor: textoLocais(evento) },
        { rotulo: "Protocolo", valor: protocolo },
      ]),
      subtitulo("E agora?"),
      passos([
        { titulo: "Fique de olho no WhatsApp", texto: "Você será adicionado ao grupo da missão, onde vamos compartilhar avisos, horários e a lista de doações." },
        { titulo: "Separe o que levar", texto: "Confira o check-list abaixo com calma. Ele também será enviado no grupo." },
        { titulo: "Prepare o coração", texto: "Ore pela equipe, pelas famílias e pelas comunidades. A missão começa antes da viagem." },
      ]),
      checklist.length ? subtitulo("Check-list: o que levar") + lista(checklist) : "",
      contatos(evento.contatos),
      botao("Ver detalhes do evento", urlEvento, "terra"),
    ].join(""),
  });

  const texto = textoPlano([
    `${saudacao(nome)} Sua vaga em ${evento.nome} está confirmada!`,
    `Protocolo: ${protocolo}`,
    `Quando: ${formatDateRange(evento.dataInicio, evento.dataFim)}`,
    evento.locais.length ? `Onde: ${textoLocais(evento).replace(/\n/g, "; ")}` : null,
    "",
    "E agora? Fique de olho no WhatsApp (você será adicionado ao grupo da missão), separe o que levar e prepare o coração.",
    checklist.length ? `\nCheck-list:\n${checklist.map((i) => `- ${i}`).join("\n")}` : null,
    "",
    `Detalhes: ${urlEvento}`,
  ]);

  return { assunto: `Vaga confirmada · ${evento.nome}`, html, texto };
}

/* ---------- convite para o Plano Mantenedor (pós-evento) ---------- */

export function emailConviteMantenedor({
  nome,
  eventoNome,
  urlMantenedor,
  chavePix,
  valorSugerido,
  whatsapp,
}: {
  nome: string | null;
  eventoNome: string;
  urlMantenedor: string;
  chavePix: string;
  valorSugerido: number;
  whatsapp: string;
}): EmailPronto {
  const valor = valorSugerido.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  const html = moldura({
    preheader: `Obrigado por fazer parte de ${eventoNome}! Que tal continuar semeando com a gente?`,
    conteudo: [
      titulo("Obrigado por semear com a gente!", "Plano Mantenedor"),
      paragrafo(
        `${saudacaoHtml(nome)} Que privilégio foi ter você em <strong style="color:#34281f">${multilinha(eventoNome)}</strong>. Cada visita, cada conversa e cada oração deixaram sementes no sertão — e a missão continua depois que a viagem termina.`,
      ),
      paragrafo(
        `Se você sente o desejo de continuar incentivando, colaborando e servindo ao povo do sertão, junte-se ao <strong style="color:#34281f">Plano Mantenedor</strong>, com uma oferta de <strong style="color:#34281f">apenas ${valor} por mês</strong>. Ela ajuda a custear os recursos para alcançar um dos povos menos evangelizados do nosso país.`,
      ),
      destaque({ rotulo: "Oferta mensal sugerida", valor: `${valor} por mês`, tom: "folha" }),
      infos([{ rotulo: "Chave Pix (e-mail)", valor: chavePix }]),
      subtitulo("Como participar"),
      passos([
        { titulo: "Faça o Pix", texto: `Use a chave acima ou o QR Code da nossa página, com o valor que puder (o sugerido é ${valor}).` },
        { titulo: "Deixe programado", texto: "No app do seu banco, agende o Pix para se repetir todo mês." },
        { titulo: "Avise a gente", texto: `Mande uma mensagem no WhatsApp ${multilinha(whatsapp)} para entrar na lista de mantenedores.` },
      ]),
      botao("Ver QR Code e detalhes", urlMantenedor),
      paragrafo(`<em>Se não puder agora, tudo bem: sua oração e sua presença já fazem parte desta história. Obrigado!</em>`),
    ].join(""),
  });

  const texto = textoPlano([
    `${saudacao(nome)} Obrigado por fazer parte de ${eventoNome}!`,
    "",
    `Que tal continuar semeando com a gente? Junte-se ao Plano Mantenedor com ${valor} por mês.`,
    `Chave Pix (e-mail): ${chavePix}`,
    "",
    "Como participar: faça o Pix, deixe agendado para todo mês e nos avise no WhatsApp " + whatsapp + ".",
    `QR Code e detalhes: ${urlMantenedor}`,
  ]);

  return { assunto: `Obrigado por semear com a gente · Plano Mantenedor`, html, texto };
}

/* ---------- mensagem da secretaria (escrita no painel) ---------- */

export function emailMensagem({ nome, assunto, mensagem, eventoNome, remetente }: { nome: string | null; assunto: string; mensagem: string; eventoNome: string; remetente: string }): EmailPronto {
  const html = moldura({
    preheader: mensagem.slice(0, 120),
    conteudo: [
      titulo(assunto, eventoNome),
      paragrafo(saudacaoHtml(nome)),
      paragrafo(multilinha(mensagem)),
      paragrafo(`Um abraço,<br><strong style="color:#34281f">${multilinha(remetente)}</strong><br>Secretaria da Missão Semear no Sertão`),
    ].join(""),
  });
  const texto = textoPlano([saudacao(nome), "", mensagem, "", `Um abraço,\n${remetente}\nSecretaria da Missão Semear no Sertão`]);
  return { assunto, html, texto };
}

/* ---------- redefinição de senha ---------- */

export function emailRedefinirSenha({ nome, url, validadeMinutos }: { nome: string; url: string; validadeMinutos: number }): EmailPronto {
  const html = moldura({
    preheader: "Link para criar uma nova senha do painel.",
    conteudo: [
      titulo("Redefinir sua senha", "Painel da missão"),
      paragrafo(`${saudacaoHtml(nome)} Recebemos um pedido para redefinir a senha do seu acesso ao painel do Semear no Sertão.`),
      botao("Criar nova senha", url),
      paragrafo(`O link vale por ${validadeMinutos} minutos e só pode ser usado uma vez. Se não foi você que pediu, ignore este e-mail: sua senha continua a mesma.`),
      paragrafo(`<span style="font-size:12px;color:#8a7b6e">Se o botão não funcionar, copie e cole no navegador:<br><span style="word-break:break-all">${multilinha(url)}</span></span>`),
    ].join(""),
  });
  const texto = textoPlano([
    saudacao(nome),
    "Recebemos um pedido para redefinir a senha do seu acesso ao painel do Semear no Sertão.",
    `Crie uma nova senha (válido por ${validadeMinutos} minutos): ${url}`,
    "Se não foi você que pediu, ignore este e-mail.",
  ]);
  return { assunto: "Redefinir sua senha — Semear no Sertão", html, texto };
}

/* ---------- primeiro acesso ao painel ---------- */

export function emailCriarSenha({ nome, url }: { nome: string; url: string }): EmailPronto {
  const html = moldura({
    preheader: "Seu acesso ao painel foi liberado. Crie sua senha.",
    conteudo: [
      titulo("Crie sua senha", "Painel da missão"),
      paragrafo(`${saudacaoHtml(nome)} Seu acesso ao painel do Semear no Sertão foi liberado. Para entrar, crie sua senha pelo botão abaixo.`),
      botao("Criar minha senha", url),
      paragrafo("O link vale por 24 horas e só pode ser usado uma vez. Se você não pediu este acesso, ignore este e-mail."),
      paragrafo(`<span style="font-size:12px;color:#8a7b6e">Se o botão não funcionar, copie e cole no navegador:<br><span style="word-break:break-all">${multilinha(url)}</span></span>`),
    ].join(""),
  });
  const texto = textoPlano([
    saudacao(nome),
    "Seu acesso ao painel do Semear no Sertão foi liberado.",
    `Crie sua senha (válido por 24 horas): ${url}`,
    "Se você não pediu este acesso, ignore este e-mail.",
  ]);
  return { assunto: "Crie sua senha do painel — Semear no Sertão", html, texto };
}
