import Link from "next/link";
import { siteConfig } from "@/lib/content";
import { Icon, type IconName } from "@/components/ui/Icon";
import styles from "./Upcoming.module.css";

const icons: IconName[] = ["calendar", "bag"];

/** Prévia das próximas áreas do site (inscrições e lojinha). */
export function Upcoming() {
  return (
    <section className={styles.upcoming} aria-labelledby="upcoming-title">
      <div className="container">
        <div className={styles.panel}>
          <div className={styles.intro}>
            <p className="eyebrow">O que vem por aí</p>
            <h2 id="upcoming-title">Estamos preparando novos jeitos de caminhar junto.</h2>
          </div>
          <ul className={styles.list}>
            {siteConfig.upcoming.map((item, index) => (
              <li key={item.title} className={styles.item}>
                <span className={styles.icon}>
                  <Icon name={icons[index % icons.length]} size={24} />
                </span>
                <div>
                  <h3>
                    {item.title} <span className={styles.status}>{item.status}</span>
                  </h3>
                  <p>{item.description}</p>
                  {"href" in item && (
                    <Link href={item.href} className={styles.link}>
                      Conhecer <Icon name="arrow" size={16} />
                    </Link>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
