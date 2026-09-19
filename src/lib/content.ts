import type { SiteConfig } from "@/types/content";

export const siteConfig = {
  name: "Projeto Semear",
  shortName: "Semear",
  eyebrow: "MISSÃO SEMEAR NO SERTÃO",
  hero: {
    title: "Espalhando a semente da salvação",
    description:
      "Caminhamos com igrejas, voluntários e comunidades para que a presença de Cristo floresça onde a vida acontece.",
    image: "/images/hero-arte.svg",
    alt: "Ilustração conceitual do Projeto Semear: sol, morros do sertão e sementes",
  },
  mission: {
    label: "Nossa semente",
    title: "A missão nasce do encontro e cresce em comunidade.",
    description:
      "O Projeto Semear é uma iniciativa missionária em construção, voltada a servir o Nordeste com escuta, presença e parcerias duradouras. Queremos somar àquilo que Deus já está fazendo em cada lugar.",
    statement:
      "Comunidades fortalecidas para viver, servir e multiplicar esperança no sertão nordestino.",
  },
  statistics: [
    { value: "30", label: "comunidades alcançadas" },
    { value: "6", label: "anos de projeto" },
    { value: "+200", label: "voluntários mobilizados" },
    { value: "1", label: "povoado a longo prazo" },
  ],
  projects: [
    {
      number: "01",
      title: "Presença no campo",
      description: "Visitas, escuta e apoio a igrejas e famílias que fazem do sertão o seu lar.",
      tag: "Missões",
    },
    {
      number: "02",
      title: "Formação que multiplica",
      description: "Espaços de aprendizado e cuidado para líderes, voluntários e novas gerações.",
      tag: "Capacitação",
    },
    {
      number: "03",
      title: "Parcerias que florescem",
      description: "Conexões entre pessoas e igrejas para servir com continuidade, respeito e propósito comum.",
      tag: "Mobilização",
    },
  ],
  participation: [
    { number: "01", title: "Ore", description: "Sustente cada comunidade, família e equipe com intercessão constante." },
    { number: "02", title: "Vá", description: "Coloque seus dons à disposição em ações e experiências missionárias futuras." },
    { number: "03", title: "Contribua", description: "Ajude a tornar possíveis os próximos passos, projetos e deslocamentos." },
    { number: "04", title: "Compartilhe", description: "Apresente o Semear à sua igreja, rede de amigos e comunidade." },
  ],
  links: {
    participation: "https://docs.google.com/forms/d/e/1FAIpQLSeEyw9kplkwU2v0juYY365Tpt2A-20Zg6bdyFNi0WIbEQTWsw/viewform?usp=dialog",
    whatsapp: "",
    donation: "",
    instagram: "https://www.instagram.com/missaosemearnosertao/",
    youtube: "https://www.youtube.com/@MissaoSemearnoSertao",
  },
} as const satisfies SiteConfig;