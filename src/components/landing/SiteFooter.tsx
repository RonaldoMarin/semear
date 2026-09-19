import { siteConfig } from "@/lib/content";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <a className="brand brand-footer" href="#inicio" aria-label="Projeto Semear, início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo brand-logo-footer" src="/images/semear-logo.svg" alt="Projeto Semear" />
        </a>
        <nav className="footer-social" aria-label="Redes sociais do Semear">
          <a href={siteConfig.links.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram do Semear (abre em nova aba)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" /></svg>
            Instagram
          </a>
          <a href={siteConfig.links.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube do Semear (abre em nova aba)">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true" focusable="false"><rect x="2" y="5" width="20" height="14" rx="4" /><path d="m10 9 5 3-5 3Z" fill="currentColor" stroke="none" /></svg>
            YouTube
          </a>
        </nav>
      </div>
      <div className="container footer-bottom"><span>© {new Date().getFullYear()} Projeto Semear</span><span><strong>Vocês foram escolhidos para irem e darem frutos.</strong></span></div>
    </footer>
  );
}