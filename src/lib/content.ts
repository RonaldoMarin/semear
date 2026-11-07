import type { SiteConfig } from "@/types/content";

/**
 * Conteúdo editável do site institucional.
 * Os links da navegação começam com "/" para funcionarem a partir de qualquer
 * página (ex.: futuras /inscricoes e /loja voltando para as seções da home).
 */
export const siteConfig = {
  name: "Semear no Sertão",
  shortName: "Semear",
  tagline: "Missão Semear no Sertão",
  whatsappDisplay: "(81) 99333-6981",
  navigation: [
    { label: "A missão", href: "/#missao" },
    { label: "Como atuamos", href: "/#frentes" },
    { label: "Participe", href: "/#participe" },
    { label: "Seja mantenedor", href: "/mantenedor" },
    { label: "Inscrições", href: "/inscricoes" },
    { label: "Loja", href: "/loja" },
    { label: "Contato", href: "/#contato" },
  ],
  hero: {
    eyebrow: "Missão no sertão nordestino",
    title: "Espalhando a semente",
    highlight: "da salvação",
    description:
      "Caminhamos com igrejas, voluntários e comunidades do sertão para que a presença de Cristo floresça onde a vida acontece.",
    image: "/images/semear-encontro.jpeg",
    alt: "Jovens da missão reunidos ao ar livre, sentados sobre pedras ao entardecer",
  },
  statistics: [
    { value: "30", label: "comunidades alcançadas" },
    { value: "6", label: "anos de missão" },
    { value: "+200", label: "voluntários mobilizados" },
    { value: "1", label: "povoado acompanhado a longo prazo" },
  ],
  mission: {
    label: "Nossa missão",
    title: "A semente nasce do encontro e cresce em comunidade.",
    description:
      "O Semear no Sertão é uma iniciativa missionária da igreja para servir o Nordeste com escuta, presença e parcerias duradouras. Não chegamos com respostas prontas: queremos somar àquilo que Deus já está fazendo em cada lugar.",
    statement:
      "Comunidades fortalecidas para viver, servir e multiplicar esperança no sertão nordestino.",
  },
  verse: {
    text: "Vocês não me escolheram, mas eu os escolhi para irem e darem fruto, fruto que permaneça.",
    reference: "João 15:16",
  },
  fronts: [
    {
      title: "Presença no campo",
      description:
        "Visitas, escuta e apoio a igrejas e famílias que fazem do sertão o seu lar — antes, durante e depois de cada viagem.",
      tag: "Missões",
      icon: "presence",
    },
    {
      title: "Formação que multiplica",
      description:
        "Espaços de aprendizado e cuidado para líderes locais, voluntários e novas gerações.",
      tag: "Discipulado",
      icon: "growth",
    },
    {
      title: "Parcerias que florescem",
      description:
        "Conexões entre pessoas e igrejas para servir com continuidade, respeito e propósito comum.",
      tag: "Mobilização",
      icon: "hands",
    },
  ],
  story: {
    eyebrow: "Presença antes de pressa",
    title: "Servir também é sentar, ouvir e aprender.",
    description:
      "Queremos que mais pessoas conheçam Jesus. Por isso vamos às comunidades para compartilhar o evangelho, ouvir suas histórias e caminhar junto — também depois que a viagem termina.",
  },
  participation: [
    {
      title: "Ore",
      description: "Sustente cada comunidade, família e equipe com intercessão constante.",
      icon: "pray",
    },
    {
      title: "Vá",
      description: "Coloque seus dons à disposição nas próximas viagens e ações missionárias.",
      icon: "go",
    },
    {
      title: "Contribua",
      description: "Seja mantenedor com R$ 10 por mês e ajude a tornar possíveis os deslocamentos, materiais e próximos passos.",
      icon: "give",
      href: "/mantenedor",
      linkLabel: "Seja mantenedor",
    },
    {
      title: "Compartilhe",
      description: "Apresente o Semear à sua igreja, sua família e seus amigos.",
      icon: "share",
    },
  ],
  upcoming: [
    {
      title: "Área do participante",
      description:
        "Acompanhe sua inscrição, pagamentos e avisos da viagem em um só lugar.",
      status: "Em breve",
    },
    {
      title: "Lojinha da missão",
      description:
        "Camisetas e produtos cuja renda ajuda a sustentar as viagens e o trabalho nas comunidades.",
      status: "Já no ar",
      href: "/loja",
    },
  ],
  links: {
    /** página de inscrições do próprio site (leva direto ao evento quando só um está aberto) */
    participation: "/inscricoes",
    whatsapp:
      "https://api.whatsapp.com/send?phone=5581993336981&text=" +
      encodeURIComponent("Olá! Vim pelo site do Semear no Sertão e gostaria de saber mais sobre a missão."),
    donation: "",
    instagram: "https://www.instagram.com/missaosemearnosertao/",
    youtube: "https://www.youtube.com/@MissaoSemearnoSertao",
  },
} as const satisfies SiteConfig;
