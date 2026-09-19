import { siteConfig } from "@/lib/content";

export function Projects() {
  return (
    <section className="projects section" id="projetos" aria-labelledby="projects-title">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">Onde queremos servir</p><h2 id="projects-title">Frentes simples, relações profundas.</h2></div>
        </div>
        <div className="projects-grid">
          {siteConfig.projects.map((project) => (
            <article className="project-card" key={project.number}>
              <div className="project-meta"><span>{project.number}</span><span>{project.tag}</span></div>
              <h3>{project.title}</h3><p>{project.description}</p>
              <a href="#participar" aria-label={`Saiba como participar: ${project.title}`}>Descobrir caminhos</a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}