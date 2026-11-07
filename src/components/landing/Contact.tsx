import { siteConfig } from "@/lib/content";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/site/Logo";
import styles from "./Contact.module.css";

export function Contact() {
  const { links } = siteConfig;

  return (
    <section className={styles.contact} id="contato" aria-labelledby="contact-title">
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <p className={styles.kicker}>Vamos caminhar juntos?</p>
          <h2 id="contact-title">A próxima história de esperança pode começar com você.</h2>
          <p>
            Chame a equipe no WhatsApp pelo <strong>{siteConfig.whatsappDisplay}</strong>, ou acompanhe as viagens e os
            testemunhos nas nossas redes.
          </p>
          <div className={styles.actions}>
            <a className="button button-dark" href={links.whatsapp} target="_blank" rel="noopener noreferrer">
              <Icon name="whatsapp" /> Falar no WhatsApp
              <span className="visually-hidden"> (abre em nova aba)</span>
            </a>
            <a className={`button ${styles.secondary}`} href={links.instagram} target="_blank" rel="noopener noreferrer">
              <Icon name="instagram" className={styles.instagram} /> Instagram
              <span className="visually-hidden"> (abre em nova aba)</span>
            </a>
            <a className={`button ${styles.secondary}`} href={links.youtube} target="_blank" rel="noopener noreferrer">
              <Icon name="youtube" className={styles.youtube} /> YouTube
              <span className="visually-hidden"> (abre em nova aba)</span>
            </a>
          </div>
        </div>
        <Logo format="simbolo" className={styles.symbol} alt="" />
      </div>
    </section>
  );
}
