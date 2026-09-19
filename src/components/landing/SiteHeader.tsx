export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="container header-inner">
        <a className="brand" href="#inicio" aria-label="Projeto Semear, início">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="brand-logo" src="/images/semear-texto.svg" alt="Projeto Semear" />
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#missao">A missão</a>
          <a href="#impacto">Impacto</a>
          <a href="#projetos">Frentes</a>
          <a href="#participar">Participe</a>
        </nav>
        <a className="header-cta" href="#participar">
          Caminhe junto
        </a>
      </div>
    </header>
  );
}