import { siteConfig } from "@/lib/content";

export function Participation() {
  return (
    <section className="participation section" id="participar" aria-labelledby="participation-title">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">Há lugar para você</p><h2 id="participation-title">A missão ganha força quando é compartilhada.</h2></div>
          <a className="text-link" href="#contato">Fale com a equipe</a>
        </div>
        <div className="participation-grid">
          {siteConfig.participation.map((item) => (
            <article className="participation-card" key={item.number}>
              <span>{item.number}</span><h3>{item.title}</h3><p>{item.description}</p>
              <a href="#contato" aria-label={`${item.title}: fale com a equipe`}>Conhecer mais</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}