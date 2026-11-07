import { siteConfig } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import styles from "./Fronts.module.css";

export function Fronts() {
  return (
    <section className="section" id="frentes" aria-labelledby="fronts-title">
      <div className="container">
        <header className={styles.heading}>
          <p className="eyebrow">Como atuamos</p>
          <h2 id="fronts-title" className="section-title">
            Frentes simples, relações profundas.
          </h2>
        </header>

        <ul className={styles.grid}>
          {siteConfig.fronts.map((front) => (
            <li className={styles.card} key={front.title}>
              <span className={styles.icon}>
                <Icon name={front.icon} size={28} />
              </span>
              <span className={styles.tag}>{front.tag}</span>
              <h3>{front.title}</h3>
              <p>{front.description}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
