import { siteConfig } from "@/lib/content";
import styles from "./Mission.module.css";

export function Mission() {
  const { mission, verse } = siteConfig;

  return (
    <section className={`section ${styles.mission}`} id="missao" aria-labelledby="mission-title">
      <div className={`container ${styles.grid}`}>
        <div>
          <p className="eyebrow">{mission.label}</p>
          <h2 id="mission-title" className="section-title">
            {mission.title}
          </h2>
        </div>
        <div className={styles.copy}>
          <p>{mission.description}</p>
          <p className={styles.statement}>{mission.statement}</p>
        </div>
      </div>

      <figure className={`container ${styles.verse}`}>
        <blockquote>
          <p>“{verse.text}”</p>
        </blockquote>
        <figcaption>{verse.reference}</figcaption>
      </figure>
    </section>
  );
}
