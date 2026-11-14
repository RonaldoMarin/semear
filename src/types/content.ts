export interface NavItem {
  label: string;
  href: string;
}

export interface SiteHero {
  eyebrow: string;
  title: string;
  highlight: string;
  description: string;
  image: string;
  alt: string;
}

export interface SiteMission {
  label: string;
  title: string;
  description: string;
  statement: string;
}

export interface SiteVerse {
  text: string;
  reference: string;
}

export interface SiteStatistic {
  value: string;
  label: string;
}

export type FrontIcon = "presence" | "growth" | "hands";

export interface SiteFront {
  title: string;
  description: string;
  tag: string;
  icon: FrontIcon;
}

export interface SiteStory {
  eyebrow: string;
  title: string;
  description: string;
}

export type ParticipationIcon = "pray" | "go" | "give" | "share";

export interface SiteParticipation {
  title: string;
  description: string;
  icon: ParticipationIcon;
  /** link opcional ("Saiba mais") */
  href?: string;
  linkLabel?: string;
}

export interface SiteUpcoming {
  title: string;
  description: string;
  status: string;
  /** quando a área já existe, vira link */
  href?: string;
}

export interface SiteLinks {
  participation: string;
  whatsapp: string;
  donation: string;
  instagram: string;
  youtube: string;
}

export interface SiteConfig {
  name: string;
  shortName: string;
  tagline: string;
  /** Número do WhatsApp formatado para exibição. */
  whatsappDisplay: string;
  navigation: NavItem[];
  /** Mapa do site no rodapé: inclui páginas que no topo ficam no botão de destaque. */
  footerNavigation: NavItem[];
  hero: SiteHero;
  statistics: SiteStatistic[];
  mission: SiteMission;
  verse: SiteVerse;
  fronts: SiteFront[];
  story: SiteStory;
  participation: SiteParticipation[];
  upcoming: SiteUpcoming[];
  links: SiteLinks;
}
