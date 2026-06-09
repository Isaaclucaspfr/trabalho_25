import api from '../api/cliente-api.js';
import { requireAdmin } from '../context/sessao-autenticacao.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';
import { formatCurrency, formatDate, setButtonLoading, showToast } from '../utils/auxiliares-interface.js';

export async function AdminEventsPage() {
  const container = document.createElement('div');
  container.className = 'container';
  if (!requireAdmin()) return container;
  container.innerHTML = '<div class="page-loading">Carregando gestão...</div>';

  let events = [];
  let locations = [];
  let artists = [];
  let editingId = null;

  const formTemplate = () => `
    <form class="panel admin-event-form" id="event-form">
      <div class="section-head compact">
        <div><h2>${editingId ? 'Editar evento' : 'Novo evento'}</h2><p>Preencha os dados de publicação e capacidade.</p></div>
        ${editingId ? '<button type="button" class="ghost-btn" id="cancel-edit">Cancelar edição</button>' : ''}
      </div>
      <div class="form-grid">
        <label class="span-2">Título<input name="title" required minlength="3"></label>
        <label>Categoria<input name="category" required></label>
        <label>Status<select name="status"><option>PUBLISHED</option><option>DRAFT</option><option>SOLD_OUT</option><option>CANCELED</option></select></label>
        <label>Data<input name="eventDate" type="date" required></label>
        <label>Horário<input name="time" type="time" required></label>
        <label>Capacidade<input name="capacity" type="number" min="1" required></label>
        <label>Preço<input name="price" type="number" min="0" step="0.01" required></label>
        <label class="span-2">Local<select name="locationId" required><option value="">Selecione</option>${locations.map((location) => `<option value="${location.id}">${location.name} - ${location.city}</option>`).join('')}</select></label>
        <label class="check-row"><input name="highlighted" type="checkbox"> Evento em destaque</label>
      </div>
      <label>Descrição<textarea name="description" class="text-area" required minlength="10"></textarea></label>
      <fieldset class="artist-fieldset"><legend>Artistas</legend><div class="artist-tags">${artists.map((artist) => `<label class="tag"><input type="checkbox" name="artistIds" value="${artist.id}"> ${artist.name}</label>`).join('')}</div></fieldset>
      <button type="submit">${editingId ? 'Salvar alterações' : 'Criar evento'}</button>
    </form>
  `;

  const listTemplate = () => `
    <section class="panel">
      <div class="section-head compact"><div><h2>Eventos cadastrados</h2><p>${events.length} registro(s)</p></div></div>
      <div class="admin-table">
        ${events.map((event) => `
          <article class="admin-event-row" data-id="${event.id}">
            <div><strong>${event.title}</strong><span>${event.category} · ${event.location?.city || '-'}</span></div>
            <span>${formatDate(event.eventDate)} ${event.time}</span>
            <span>${formatCurrency(event.price)}</span>
            <span class="pill status ${event.status.toLowerCase()}">${event.status}</span>
            <div class="row-actions"><button class="ghost-btn" data-action="edit">Editar</button><button class="outline-btn" data-action="delete">Excluir</button></div>
          </article>
        `).join('') || '<p>Nenhum evento cadastrado.</p>'}
      </div>
    </section>
  `;

  const render = () => {
    container.innerHTML = `
      <section class="section-head">
        <div><h1>Gestão de Eventos</h1><p>Crie, publique e atualize o catálogo da plataforma.</p></div>
        <a href="/admin" class="ghost-btn" data-link>Voltar ao dashboard</a>
      </section>
      ${formTemplate()}
      ${listTemplate()}
    `;

    const form = container.querySelector('#event-form');
    if (editingId) {
      const current = events.find((event) => event.id === editingId);
      Object.entries({
        title: current.title,
        category: current.category,
        status: current.status,
        eventDate: current.eventDate.slice(0, 10),
        time: current.time,
        capacity: current.capacity,
        price: current.price,
        locationId: current.locationId,
        description: current.description
      }).forEach(([name, value]) => { form.elements[name].value = value; });
      form.elements.highlighted.checked = current.highlighted;
      const selectedArtists = new Set((current.artists || []).map((item) => item.artistId));
      form.querySelectorAll('[name="artistIds"]').forEach((input) => { input.checked = selectedArtists.has(input.value); });
      container.querySelector('#cancel-edit').addEventListener('click', () => {
        editingId = null;
        render();
      });
    }

    form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const button = form.querySelector('[type="submit"]');
      const formData = new FormData(form);
      const payload = {
        title: formData.get('title'),
        category: formData.get('category'),
        status: formData.get('status'),
        eventDate: formData.get('eventDate'),
        time: formData.get('time'),
        capacity: Number(formData.get('capacity')),
        price: Number(formData.get('price')),
        locationId: formData.get('locationId'),
        description: formData.get('description'),
        highlighted: formData.get('highlighted') === 'on',
        artistIds: formData.getAll('artistIds')
      };
      setButtonLoading(button, true);
      try {
        if (editingId) await api.put(`/events/${editingId}`, payload);
        else await api.post('/events', payload);
        showToast(editingId ? 'Evento atualizado.' : 'Evento criado.');
        editingId = null;
        await load();
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
        setButtonLoading(button, false);
      }
    });
  };

  const load = async () => {
    const [eventsRes, locationsRes, artistsRes] = await Promise.all([
      api.get('/events', { params: { limit: 100, sortBy: 'eventDate', sortOrder: 'asc' } }),
      api.get('/locations'),
      api.get('/artists')
    ]);
    events = eventsRes.data.data || [];
    locations = locationsRes.data || [];
    artists = artistsRes.data || [];
    render();
  };

  container.addEventListener('click', async (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    const id = event.target.closest('[data-id]').dataset.id;
    if (action === 'edit') {
      const { data } = await api.get(`/events/${id}`);
      const index = events.findIndex((item) => item.id === id);
      events[index] = data;
      editingId = id;
      render();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (action === 'delete' && window.confirm('Excluir este evento?')) {
      try {
        await api.delete(`/events/${id}`);
        showToast('Evento excluído.');
        await load();
      } catch (error) {
        showToast(getErrorMessage(error), 'error');
      }
    }
  });

  try {
    await load();
  } catch (error) {
    container.innerHTML = `<div class="panel danger">${getErrorMessage(error, 'Não foi possível carregar a gestão.')}</div>`;
  }
  return container;
}
