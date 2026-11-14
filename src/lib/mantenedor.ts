import { pixCopiaECola } from "./pix";

/**
 * Plano Mantenedor: dados da campanha (vindos do banner oficial).
 * Edite aqui para mudar valor sugerido, chave Pix ou textos.
 */
export const mantenedor = {
  valorSugerido: 10,
  chavePix: "projetomissionariosemear316@gmail.com",
  // nome e cidade que aparecem no QR Code (o banco mostra o titular real da chave ao pagar)
  nomeRecebedor: "Missao Semear no Sertao",
  cidadeRecebedor: "Natal",
  whatsapp: "(81) 99333-6981",
  instagram: "missaosemearnosertao",
  email: "syssemear@gmail.com",
  /** para onde a oferta vai — ajuste se quiser detalhar */
  apoia: [
    "Deslocamento das equipes até as comunidades",
    "Alimentação durante as viagens missionárias",
    "Materiais de evangelismo e ações com as crianças",
    "Acompanhamento das famílias depois das viagens",
  ],
};

/** Pix sem valor fixo: quem doa digita quanto quer (o sugerido é R$ 10). */
export const pixMantenedor = pixCopiaECola({
  chave: mantenedor.chavePix,
  nome: mantenedor.nomeRecebedor,
  cidade: mantenedor.cidadeRecebedor,
  txid: "MANTENEDOR",
  descricao: "Plano Mantenedor",
});

export const mensagemQueroSerMantenedor =
  "Olá! Quero fazer parte do Plano Mantenedor da Missão Semear no Sertão 🌵 Como faço para contribuir todo mês?";
