import { siteConfig } from "@/lib/content";

export function Hero() {
  return (
    <section className="hero" id="inicio" aria-labelledby="hero-title">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className="hero-image" src={siteConfig.hero.image} alt={siteConfig.hero.alt} />
      <div className="hero-overlay" />
      <div className="container hero-content">
        <p className="eyebrow eyebrow-light">{siteConfig.eyebrow}</p>
        <h1 id="hero-title">
          {siteConfig.hero.title.split("\n").map((line) => <span key={line}>{line}</span>)}
        </h1>
        <p className="hero-description">{siteConfig.hero.description}</p>
        <div className="hero-actions">
          <a className="button button-primary" href={siteConfig.links.participation}>Quero participar</a>
          <a className="button button-ghost" href="#missao">Conheça a missão</a>
        </div>
      </div>
      <a className="hero-scroll" href="#missao"><span className="scroll-line" aria-hidden="true" />Role para conhecer</a>
    </section>
  );
}