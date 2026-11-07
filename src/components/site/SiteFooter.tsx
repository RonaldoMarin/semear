import Link from "next/link";
import { siteConfig } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "./Logo";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.top}`}>
        <div className={styles.about}>
          <Link href="/" aria-label="Semear no Sertão, página inicial">
            <Logo variant="claro" className={styles.logo} />
          </Link>
          <p>Uma missão da igreja para espalhar a semente da salvação e caminhar junto com as comunidades do sertão nordestino.</p>
        </div>

        <nav className={styles.column} aria-label="Mapa do site">
          <h2>Navegue</h2>
          <ul>
            {siteConfig.navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.column}>
          <h2>Fale com a gente</h2>
          <ul>
            <li>
              <a href={siteConfig.links.whatsapp} target="_blank" rel="noopener noreferrer">
                <Icon name="whatsapp" size={20} /> {siteConfig.whatsappDisplay}
                <span className="visually-hidden"> no WhatsApp (abre em nova aba)</span>
              </a>
            </li>
            <li>
              <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer">
                <Icon name="instagram" size={20} /> Instagram
                <span className="visually-hidden"> (abre em nova aba)</span>
              </a>
            </li>
            <li>
              <a href={siteConfig.links.youtube} target="_blank" rel="noopener noreferrer">
                <Icon name="youtube" size={20} /> YouTube
                <span className="visually-hidden"> (abre em nova aba)</span>
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className={`container ${styles.bottom}`}>
        <span>© {new Date().getFullYear()} {siteConfig.name}</span>
        <span className={styles.verse}>
          “{siteConfig.verse.text}” — {siteConfig.verse.reference}
        </span>
      </div>
    </footer>
  );
}
