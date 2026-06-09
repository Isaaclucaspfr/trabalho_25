import api from '../api/cliente-api.js';
import { requireAuth } from '../context/sessao-autenticacao.js';
import { createEventCard } from '../components/cartao-evento.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';
import { showToast } from '../utils/auxiliares-interface.js';

export async function FavoritesPage() {
  const container = document.createElement('div');
  container.className = 'container';
  if (!requireAuth()) return container;

  container.innerHTML = '<div class="page-loading">Carregando favoritos...</div>';
  try {
    const { data } = await api.get('/users/favorites');
    container.innerHTML = `
      <section class="section-head">
        <div><h1>Meus Favoritos</h1><p>Seus eventos preferidos reunidos em um só lugar.</p></div>
        <a href="/events" class="ghost-btn" data-link>Explorar eventos</a>
      </section>
      <div class="grid" id="favorites-grid"></div>
    `;
    const grid = container.querySelector('#favorites-grid');

    const renderEmpty = () => {
      if (!grid.children.length) {
        grid.innerHTML = '<div class="panel empty-state"><h2>Nenhum favorito ainda</h2><p>Explore o catálogo e guarde os eventos que mais interessam.</p><a href="/events" class="hero-btn" data-link>Ver eventos</a></div>';
      }
    };

    data.forEach(({ event }) => {
      const card = createEventCard(event, async (eventId) => {
        try {
          await api.post(`/users/favorites/${eventId}`);
          card.remove();
          renderEmpty();
          showToast('Evento removido dos favoritos.');
        } catch (error) {
          showToast(getErrorMessage(error), 'error');
        }
      });
      card.querySelector('.favorite-btn').textContent = 'Remover';
      grid.appendChild(card);
    });
    renderEmpty();
  } catch (error) {
    container.innerHTML = `<div class="panel danger">${getErrorMessage(error, 'Não foi possível carregar os favoritos.')}</div>`;
  }
  return container;
}
