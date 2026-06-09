import api from '../api/cliente-api.js';

export async function AboutPage() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = '<div class="page-loading">Carregando informações...</div>';

  let stats = { totalTicketsSold: 0, citiesActive: 0, uptime: '100%', activeDays: 0 };
  try {
    stats = (await api.get('/platform/stats')).data;
  } catch {
    // O conteúdo institucional continua útil mesmo sem as métricas.
  }

  container.innerHTML = `
    <section class="hero about-hero">
      <span class="pill">Nossa plataforma</span>
      <h1>Eventos memoráveis começam com uma experiência simples.</h1>
      <p>O EventHub aproxima pessoas, artistas e produtores em uma jornada segura, da descoberta ao ingresso.</p>
      <a href="/events" class="hero-btn" data-link>Descobrir eventos</a>
    </section>
    <section class="stats about-stats">
      <article class="panel"><strong>${stats.totalTicketsSold}</strong><span>Ingressos vendidos</span></article>
      <article class="panel"><strong>${stats.citiesActive}</strong><span>Cidades ativas</span></article>
      <article class="panel"><strong>${stats.uptime}</strong><span>Taxa de sucesso</span></article>
      <article class="panel"><strong>${stats.activeDays}</strong><span>Dias de operação</span></article>
    </section>
    <section class="dashboard-grid">
      <article class="panel"><h2>Para quem participa</h2><p>Catálogo completo, favoritos, compra de ingressos e acompanhamento de pedidos em um só lugar.</p></article>
      <article class="panel"><h2>Para quem produz</h2><p>Gestão de eventos, capacidade, destaques, métricas e acompanhamento do interesse do público.</p></article>
    </section>
    <section class="panel">
      <h2>O que valorizamos</h2>
      <div class="values-grid">
        <div><strong>Clareza</strong><p>Informação objetiva em cada etapa.</p></div>
        <div><strong>Segurança</strong><p>Autenticação e controle de disponibilidade.</p></div>
        <div><strong>Acesso</strong><p>Experiência responsiva para todos os dispositivos.</p></div>
      </div>
    </section>
  `;
  return container;
}
