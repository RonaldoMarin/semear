/* eslint-disable @next/next/no-img-element */
import { siteConfig } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import styles from "./Hero.module.css";

export function Hero() {
  const { hero, statistics, links } = siteConfig;

  return (
    <section className={styles.hero} id="inicio" aria-labelledby="hero-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.copy}>
          <p className="eyebrow">{hero.eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>
            {hero.title} <em>{hero.highlight}</em>
          </h1>
          <p className={styles.description}>{hero.description}</p>
          <div className={styles.actions}>
            <a className="button button-primary" href={links.participation}>
              Quero participar <Icon name="arrow" />
            </a>
            <a className="button button-outline" href="#missao">
              Conheça a missão
            </a>
          </div>
        </div>

        <div className={styles.visual}>
          <span className={styles.sun} aria-hidden="true" />
          <div className={styles.photo}>
            <img src={hero.image} alt={hero.alt} width={1128} height={750} />
          </div>
          <div className={styles.badge}>
            <Icon name="growth" size={30} />
            <span>
              <strong>Missão da igreja</strong> no sertão nordestino
            </span>
          </div>
        </div>
      </div>

      <div className="container">
        <dl className={styles.stats}>
          {statistics.map((stat) => (
            <div key={stat.label} className={styles.stat}>
              <dt>{stat.label}</dt>
              <dd>{stat.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
