export interface SiteHero {
  title: string;
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

export interface SiteStatistic {
  value: string;
  label: string;
}

export interface SiteProject {
  number: string;
  title: string;
  description: string;
  tag: string;
}

export interface SiteParticipation {
  number: string;
  title: string;
  description: string;
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
  eyebrow: string;
  hero: SiteHero;
  mission: SiteMission;
  statistics: SiteStatistic[];
  projects: SiteProject[];
  participation: SiteParticipation[];
  links: SiteLinks;
}