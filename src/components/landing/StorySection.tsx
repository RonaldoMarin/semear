import { siteConfig } from "@/lib/content";
import styles from "./StorySection.module.css";

/** Ilustração do sertão: sol, serras, mandacaru e brotos. */
function SertaoIllustration() {
  return (
    <svg className={styles.art} viewBox="0 0 560 440" role="img" aria-label="Ilustração: sol sobre as serras do sertão, com mandacaru e brotos nascendo">
      <rect width="560" height="440" fill="#f3e8d4" />
      <circle cx="380" cy="150" r="78" fill="#e9a83b" />
      <circle cx="380" cy="150" r="112" fill="none" stroke="#e9a83b" strokeOpacity="0.35" strokeWidth="2" />
      <path d="M0 270 C90 210 150 230 220 196 C300 158 360 214 440 196 C500 182 530 200 560 190 V440 H0Z" fill="#c2673f" fillOpacity="0.55" />
      <path d="M0 310 C110 270 200 300 300 276 C400 252 470 290 560 268 V440 H0Z" fill="#5a473a" />
      <path d="M0 370 C120 340 230 362 330 348 C430 334 500 356 560 346 V440 H0Z" fill="#34281f" />
      {/* mandacaru */}
      <g fill="#4d7a1f">
        <rect x="104" y="214" width="22" height="120" rx="11" />
        <rect x="76" y="248" width="16" height="50" rx="8" />
        <rect x="76" y="286" width="40" height="14" rx="7" />
        <rect x="136" y="232" width="16" height="56" rx="8" />
        <rect x="116" y="276" width="36" height="14" rx="7" />
      </g>
      {/* brotos */}
      {[230, 300, 370, 440].map((x, i) => (
        <g key={x} transform={`translate(${x} ${388 - (i % 2) * 10})`} stroke="#7fb23f" strokeWidth="3" strokeLinecap="round" fill="#7fb23f">
          <path d="M0 0 V-26" fill="none" />
          <path d="M0 -18 C-4 -32 -18 -34 -22 -30 C-18 -22 -8 -18 0 -18Z" />
          <path d="M0 -24 C4 -38 18 -40 22 -36 C18 -28 8 -24 0 -24Z" />
        </g>
      ))}
    </svg>
  );
}

export function StorySection() {
  const { story } = siteConfig;

  return (
    <section className={styles.story} aria-labelledby="story-title">
      <div className={`container ${styles.grid}`}>
        <div className={styles.artWrap}>
          <SertaoIllustration />
        </div>
        <div className={styles.copy}>
          <p className="eyebrow eyebrow-light">{story.eyebrow}</p>
          <h2 id="story-title">{story.title}</h2>
          <p>{story.description}</p>
          <a className="button button-outline-light" href="#participe">
            Caminhe com a gente
          </a>
        </div>
      </div>
    </section>
  );
}
