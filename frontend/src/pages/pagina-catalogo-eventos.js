import api from '../api/cliente-api.js';
import { createEventCard } from '../components/cartao-evento.js';

export function EventCatalogPage() {
  const container = document.createElement('div');
  container.className = 'container';

  let page = 1;
  let meta = { page: 1, totalPages: 1 };

  container.innerHTML = `
    <section class="section-head">
      <h1>Catálogo de Eventos</h1>
      <p>Encontre por categoria, status e ordene da forma que preferir.</p>
    </section>

    <section class="panel">
      <div class="toolbar wrap" id="filter-bar">
        <input id="filter-search" placeholder="Buscar por título" />
        <input id="filter-category" placeholder="Categoria" />
        <select id="filter-status">
          <option value="">Todos os status</option>
          <option value="PUBLISHED">Publicado</option>
          <option value="DRAFT">Rascunho</option>
          <option value="SOLD_OUT">Esgotado</option>
          <option value="CANCELED">Cancelado</option>
        </select>
        <select id="filter-highlighted">
          <option value="">Todos</option>
          <option value="true">Somente destaque</option>
          <option value="false">Sem destaque</option>
        </select>
        <select id="filter-sortBy">
          <option value="eventDate">Data do evento</option>
          <option value="createdAt">Criação</option>
          <option value="price">Preço</option>
          <option value="title">Título</option>
        </select>
        <button id="apply-filters-btn">Aplicar filtros</button>
      </div>
    </section>

    <div id="catalog-state-msg"></div>
    <section class="grid" id="catalog-grid"></section>

    <div class="pagination">
      <button id="btn-prev">Anterior</button>
      <span id="pagination-info">Página 1 de 1</span>
      <button id="btn-next">Próxima</button>
    </div>
  `;

  const grid = container.querySelector('#catalog-grid');
  const msg = container.querySelector('#catalog-state-msg');
  const btnPrev = container.querySelector('#btn-prev');
  const btnNext = container.querySelector('#btn-next');
  const info = container.querySelector('#pagination-info');

  const fetchEvents = async (targetPage = page) => {
    msg.innerHTML = '<div class="skeleton-grid">' + '<div class="skeleton-card"></div>'.repeat(6) + '</div>';
    grid.innerHTML = '';
    btnPrev.disabled = true;
    btnNext.disabled = true;

    try {
      const search = container.querySelector('#filter-search').value;
      const category = container.querySelector('#filter-category').value;
      const status = container.querySelector('#filter-status').value;
      const highlighted = container.querySelector('#filter-highlighted').value;
      const sortBy = container.querySelector('#filter-sortBy').value;

      const params = { page: targetPage, limit: 9, sortOrder: 'desc', sortBy };
      if (search) params.search = search;
      if (category) params.category = category;
      if (status) params.status = status;
      if (highlighted) params.highlighted = highlighted;

      const { data } = await api.get('/events', { params });
      const events = data.data || [];
      meta = data.meta || { page: targetPage, totalPages: 1 };
      page = targetPage;

      msg.innerHTML = '';
      if (events.length === 0) {
        msg.innerHTML = '<div class="panel">Nenhum evento encontrado.</div>';
      } else {
        events.forEach(event => {
          const card = createEventCard(event, async (eventId) => {
            try {
              await api.post(`/users/favorites/${eventId}`);
              alert('Favorito atualizado.');
            } catch (err) {
              alert('Faça login para favoritar um evento.');
            }
          });
          grid.appendChild(card);
        });
      }

      info.textContent = `Página ${meta.page} de ${meta.totalPages}`;
      btnPrev.disabled = page <= 1;
      btnNext.disabled = page >= meta.totalPages;

    } catch (err) {
      msg.innerHTML = '<div class="panel danger">Não foi possível carregar o catálogo.</div>';
    }
  };

  container.querySelector('#apply-filters-btn').addEventListener('click', () => fetchEvents(1));
  btnPrev.addEventListener('click', () => fetchEvents(page - 1));
  btnNext.addEventListener('click', () => fetchEvents(page + 1));

  // Initial fetch
  fetchEvents(1);

  return container;
}
