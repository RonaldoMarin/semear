import { siteConfig } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import styles from "./Participation.module.css";

export function Participation() {
  return (
    <section className={`section ${styles.participation}`} id="participe" aria-labelledby="participation-title">
      <div className="container">
        <header className={styles.heading}>
          <div>
            <p className="eyebrow">Há lugar para você</p>
            <h2 id="participation-title" className="section-title">
              A missão ganha força quando é compartilhada.
            </h2>
          </div>
          <a className="button button-dark" href={siteConfig.links.participation}>
            Quero participar <Icon name="arrow" />
          </a>
        </header>

        <ol className={styles.grid}>
          {siteConfig.participation.map((item, index) => (
            <li className={styles.card} key={item.title}>
              <div className={styles.top}>
                <span className={styles.icon}>
                  <Icon name={item.icon} size={26} />
                </span>
                <span className={styles.number} aria-hidden="true">
                  Passo {index + 1}
                </span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              {"href" in item && item.href && (
                <a href={item.href} className={`text-link ${styles.cardLink}`}>
                  {item.linkLabel ?? "Saiba mais"} <Icon name="arrow" size={16} />
                </a>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
