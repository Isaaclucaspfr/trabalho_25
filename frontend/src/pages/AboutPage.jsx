export default function AboutPage() {
  return (
    <div className="container">
      <div className="hero home-hero" style={{ marginTop: '2rem' }}>
        <div style={{ alignSelf: 'center' }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Conectando você às melhores experiências</h1>
          <p style={{ fontSize: '1.1rem', opacity: 0.9, lineHeight: 1.6 }}>
            A EventHub nasceu com a missão de transformar a forma como as pessoas descobrem, vivem e compartilham os momentos mais inesquecíveis de suas vidas.
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <div style={{ width: '100%', height: '240px', background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.2)' }}>
            <span style={{ fontSize: '4rem' }}>🌟</span>
          </div>
        </div>
      </div>

      <section className="dashboard-grid" style={{ marginTop: '3rem' }}>
        <div className="panel">
          <h2 style={{ marginBottom: '1rem', color: 'var(--accent)' }}>Nossa História</h2>
          <p style={{ lineHeight: 1.8, color: 'var(--muted)' }}>
            Fundada em 2026, a EventHub rapidamente se tornou a principal plataforma de gestão e descoberta de eventos. Nossa tecnologia simplifica a compra de ingressos e oferece a produtores as ferramentas necessárias para criar eventos de sucesso. Acreditamos que a tecnologia deve ser invisível, permitindo que o foco esteja no que realmente importa: a experiência.
          </p>
        </div>
        <div className="panel" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div className="mini-stat">
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>Mais de 1 Milhão</span>
            <span className="muted">Ingressos Vendidos</span>
          </div>
          <div className="mini-stat">
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>+50 Cidades</span>
            <span className="muted">Eventos Realizados</span>
          </div>
          <div className="mini-stat" style={{ borderBottom: 'none' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 600 }}>99.9%</span>
            <span className="muted">Satisfação (Uptime)</span>
          </div>
        </div>
      </section>
    </div>
  );
}
