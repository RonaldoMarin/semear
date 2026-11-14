/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import QRCode from "qrcode";
import { CopiarBotao } from "@/components/site/CopiarBotao";
import { Icon } from "@/components/ui/Icon";
import { siteConfig } from "@/lib/content";
import { mantenedor, mensagemQueroSerMantenedor, pixMantenedor } from "@/lib/mantenedor";
import { linkWhatsApp } from "@/lib/whatsapp";
import styles from "./mantenedor.module.css";

export const metadata: Metadata = {
  title: "Plano Mantenedor",
  description: `Apoie a Missão Semear no Sertão com R$ ${mantenedor.valorSugerido} por mês e ajude a levar o evangelho a um dos povos menos evangelizados do país.`,
};

const fotos = [
  { src: "/images/mantenedor/foto-1.jpg", width: 1200, height: 626, alt: "Voluntários da missão trabalhando na reforma de uma casa no sertão" },
  { src: "/images/mantenedor/foto-2.jpg", width: 1200, height: 626, alt: "Missionário ajudando uma criança com uma atividade em sala de aula" },
  { src: "/images/mantenedor/foto-3.jpg", width: 1200, height: 763, alt: "Equipe preparando refeições na cozinha comunitária" },
  { src: "/images/mantenedor/foto-4.jpg", width: 1077, height: 792, alt: "Voluntários trabalhando na terra em uma comunidade rural" },
];

export default async function MantenedorPage() {
  const qr = await QRCode.toString(pixMantenedor, {
    type: "svg",
    margin: 0,
    errorCorrectionLevel: "M",
    color: { dark: "#34281f", light: "#00000000" },
  });
  const valor = mantenedor.valorSugerido.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
  const zap = linkWhatsApp(mantenedor.whatsapp, mensagemQueroSerMantenedor);

  return (
    <>
      <section className={styles.hero} aria-labelledby="mantenedor-titulo">
        <img className={styles.heroImg} src="/images/mantenedor/roda-de-conversa.jpg" alt="" />
        <div className={styles.heroOverlay} aria-hidden="true" />
        <div className={`container ${styles.heroInner}`}>
          <p className={styles.kicker}>Plano Mantenedor</p>
          <h1 id="mantenedor-titulo">Quer apoiar a missão no sertão?</h1>
          <p className={styles.lead}>
            Se você sente o desejo de incentivar, colaborar e servir ao povo do sertão, junte-se ao Plano Mantenedor com uma oferta de{" "}
            <strong>apenas {valor} por mês</strong>.
          </p>
          <div className={styles.actions}>
            <a href="#pix" className="button button-primary">
              Quero ser mantenedor <Icon name="arrow" />
            </a>
            <a href={zap} target="_blank" rel="noopener noreferrer" className="button button-outline-light">
              <Icon name="whatsapp" /> Falar no WhatsApp
            </a>
          </div>
        </div>
      </section>

      <section className={`container ${styles.intro}`}>
        <div className={styles.valorCard}>
          <span className={styles.valorLabel}>Oferta mensal sugerida</span>
          <strong className={styles.valor}>
            {valor}
            <small>/mês</small>
          </strong>
          <p>Pouco para cada um, muito para quem está no sertão. Se puder mais, toda ajuda é bem-vinda.</p>
        </div>
        <div className={styles.introTexto}>
          <h2>Sua oferta vira presença no sertão</h2>
          <p>
            Você pode se unir à missão <strong>Semear no Sertão</strong> e nos ajudar a custear nossos recursos para alcançar um dos povos menos
            evangelizados do nosso país.
          </p>
          <ul className={styles.apoia}>
            {mantenedor.apoia.map((item) => (
              <li key={item}>
                <Icon name="growth" size={18} /> {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section id="pix" className={styles.pixSection} aria-labelledby="pix-titulo">
        <div className={`container ${styles.pixGrid}`}>
          <div className={styles.pixCard}>
            <div className={styles.qr} dangerouslySetInnerHTML={{ __html: qr }} role="img" aria-label="QR Code do Pix do Plano Mantenedor" />
            <div className={styles.pixInfo}>
              <h2 id="pix-titulo">Contribua pelo Pix</h2>
              <p className={styles.pixHint}>Aponte a câmera do app do seu banco para o QR Code ou use o Pix copia e cola abaixo.</p>

              <span className={styles.campoLabel}>Pix copia e cola</span>
              <div className={styles.campo}>
                <code className={styles.copiaECola}>{pixMantenedor}</code>
                <CopiarBotao texto={pixMantenedor} rotulo="Copiar código" />
              </div>
            </div>
          </div>

          <div className={styles.passos}>
            <h3>Como se tornar mantenedor</h3>
            <ol>
              <li>
                <strong>Faça o Pix</strong>
                <span>Pelo QR Code ou pelo copia e cola, com o valor que puder (o sugerido é {valor}).</span>
              </li>
              <li>
                <strong>Deixe programado todo mês</strong>
                <span>No app do seu banco, use o &quot;Pix agendado&quot; ou &quot;Pix automático&quot; para repetir a oferta mensalmente.</span>
              </li>
              <li>
                <strong>Avise a gente</strong>
                <span>Mande uma mensagem no WhatsApp para entrar na nossa lista de mantenedores e receber notícias da missão.</span>
                <a href={zap} target="_blank" rel="noopener noreferrer" className={`button button-dark ${styles.zap}`}>
                  <Icon name="whatsapp" /> Avisar no WhatsApp
                </a>
              </li>
            </ol>
          </div>
        </div>
      </section>

      <section className={`container ${styles.galeria}`} aria-label="A missão em campo">
        {fotos.map((foto) => (
          <img key={foto.src} src={foto.src} width={foto.width} height={foto.height} alt={foto.alt} loading="lazy" />
        ))}
      </section>

      <section className={`container ${styles.contato}`}>
        <h2>Conheça mais a missão</h2>
        <p>Acompanhe as viagens pelo nosso Instagram ou fale com a gente pelo WhatsApp.</p>
        <div className={styles.contatoLinks}>
          <a href={zap} target="_blank" rel="noopener noreferrer">
            <Icon name="whatsapp" /> {mantenedor.whatsapp}
          </a>
          <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer">
            <Icon name="instagram" /> @{mantenedor.instagram}
          </a>
          <a href={`mailto:${mantenedor.email}`}>
            <Icon name="give" /> {mantenedor.email}
          </a>
        </div>
      </section>
    </>
  );
}
