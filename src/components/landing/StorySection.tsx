export function StorySection() {
  return (
    <section className="story-section" aria-label="Presença que acolhe">
      <div className="container story-wrap">
        <div className="story-image-wrap">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/semear-encontro.jpeg" alt="Pessoas reunidas ao ar livre, sentadas sobre pedras ao entardecer" className="story-image" />
        </div>
        <div className="story-copy">
          <p className="eyebrow">Presença antes de pressa</p>
          <h2>Servir também é sentar, ouvir e aprender.</h2>
          <p>Queremos que mais pessoas conheçam Jesus. Por isso, vamos às comunidades para compartilhar o evangelho, ouvir suas histórias e caminhar junto, também depois das visitas.</p>
          <a className="text-link" href="#missao">Por que existimos</a>
        </div>
      </div>
    </section>
  );
}