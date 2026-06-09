import api from '../api/cliente-api.js';
import { createEventCard } from '../components/cartao-evento.js';

export async function HomePage() {
  const container = document.createElement('div');
  container.className = 'container';

  // Render loading state initially
  container.innerHTML = `
    <section class="hero home-hero">
      <div>
        <h1>EventHub</h1>
        <p>Um sistema completo para descobrir eventos, acompanhar ranking em tempo real e controlar ingressos.</p>
        <div class="hero-actions">
          <a href="/events" class="hero-btn" data-link>Explorar eventos</a>
          <a href="/ranking" class="hero-btn ghost" data-link>Ver ranking</a>
        </div>
      </div>
      <div class="hero-stats">
        <article>
          <h3 id="hero-highlight-count">-</h3>
          <span>Eventos em destaque</span>
        </article>
        <article>
          <h3 id="hero-ranking-count">-</h3>
          <span>No ranking popular</span>
        </article>
        <article>
          <h3>24/7</h3>
          <span>Reservas online</span>
        </article>
      </div>
    </section>

    <section class="section-head">
      <h2>Destaques da semana</h2>
      <a href="/events" data-link>Ver catálogo completo</a>
    </section>

    <div id="home-events-grid" class="grid">
      <div class="skeleton-grid">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>

    <section class="panel ranking-preview">
      <div class="section-head compact">
        <h2>Top 5 populares</h2>
        <a href="/ranking" data-link>Abrir ranking completo</a>
      </div>
      <div id="home-ranking-list">Carregando ranking...</div>
    </section>
  `;

  try {
    const [eventsRes, rankingRes] = await Promise.all([
      api.get('/events', { params: { highlighted: true, limit: 4, sortBy: 'eventDate' } }),
      api.get('/ranking/eventos')
    ]);

    const highlighted = eventsRes.data.data || [];
    const ranking = (rankingRes.data || []).slice(0, 5);

    // Update stats
    container.querySelector('#hero-highlight-count').textContent = highlighted.length;
    container.querySelector('#hero-ranking-count').textContent = ranking.length;

    // Update Grid
    const grid = container.querySelector('#home-events-grid');
    grid.innerHTML = '';

    if (highlighted.length === 0) {
      grid.innerHTML = '<div class="panel" style="grid-column: 1 / -1;">Ainda não há eventos em destaque.</div>';
    } else {
      highlighted.forEach(event => {
        const card = createEventCard(event, async (eventId) => {
          try {
            await api.post(`/users/favorites/${eventId}`);
            alert('Favorito atualizado.');
          } catch (err) {
            alert('Faça login para favoritar eventos.');
          }
        });
        grid.appendChild(card);
      });
    }

    // Update Ranking
    const rankingList = container.querySelector('#home-ranking-list');
    rankingList.innerHTML = '';

    if (ranking.length === 0) {
      rankingList.innerHTML = '<p>Nenhum evento no ranking.</p>';
    } else {
      ranking.forEach((item, index) => {
        const row = document.createElement('div');
        row.className = 'rank-row';
        row.innerHTML = `
          <strong>#${index + 1}</strong>
          <span>${item.title}</span>
          <span>Score: ${item.popularityScore}</span>
        `;
        rankingList.appendChild(row);
      });
    }

  } catch (error) {
    console.error('Failed to load home page data', error);
  }

  return container;
}
