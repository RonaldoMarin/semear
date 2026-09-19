import { siteConfig } from "@/lib/content";

export function Mission() {
  return (
    <section className="mission section" id="missao" aria-labelledby="mission-title">
      <div className="container mission-grid">
        <div className="section-intro">
          <p className="eyebrow">{siteConfig.mission.label}</p>
          <h2 id="mission-title">{siteConfig.mission.title}</h2>
        </div>
        <div className="mission-copy">
          <p>{siteConfig.mission.description}</p>
          <div className="mission-statement">
            <span className="statement-seed" aria-hidden="true" />
            <p>{siteConfig.mission.statement}</p>
          </div>
        </div>
      </div>
    </section>
  );
}