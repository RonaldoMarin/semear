import { siteConfig } from "@/lib/content";

export function ImpactStats() {
  return (
    <section className="impact section" id="impacto" aria-labelledby="impact-title">
      <div className="container">
        <div className="section-heading section-heading-on-dark">
          <div>
            <p className="eyebrow eyebrow-light">Impacto que cria raízes</p>
            <h2 id="impact-title">Cada encontro aponta para um futuro compartilhado.</h2>
          </div>
        </div>
        <div className="stats-grid">
          {siteConfig.statistics.map((stat) => (
            <article className="stat-card" key={stat.label}>
              <strong>{stat.value}</strong><p>{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}