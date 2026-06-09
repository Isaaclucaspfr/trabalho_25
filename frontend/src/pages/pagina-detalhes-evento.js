import api from '../api/cliente-api.js';

export async function EventDetailPage() {
  const container = document.createElement('div');
  container.className = 'container';

  // Extrair ID da URL (/events/123)
  const id = window.location.pathname.split('/').pop();

  container.innerHTML = '<div class="page-loading">Carregando detalhes do evento...</div>';

  try {
    const [eventRes, ticketsRes] = await Promise.all([
      api.get(`/events/${id}`),
      api.get('/tickets/my').catch(() => ({ data: [] }))
    ]);

    const event = eventRes.data;
    const myTickets = (ticketsRes.data || []).filter(ticket => ticket.eventId === id);

    if (!event) {
      container.innerHTML = '<div class="panel">Evento não encontrado.</div>';
      return container;
    }

    const artists = event.artists || [];
    const formattedDate = new Date(event.eventDate).toLocaleDateString('pt-BR');
    const price = Number(event.price).toFixed(2);

    let ticketsHtml = '';
    if (myTickets.length === 0) {
      ticketsHtml = '<p>Você ainda não possui ingressos deste evento.</p>';
    } else {
      myTickets.forEach(ticket => {
        ticketsHtml += `
          <div class="ticket-row" data-id="${ticket.id}">
            <span>${ticket.code}</span>
            <span>Qtd: ${ticket.quantity}</span>
            <span>Status: ${ticket.status}</span>
            <div class="row-actions">
              ${ticket.status === 'RESERVED' ? `<button class="btn-pay">Pagar</button>` : ''}
              ${ticket.status !== 'CANCELED' ? `<button class="outline-btn btn-cancel">Cancelar</button>` : ''}
            </div>
          </div>
        `;
      });
    }

    let artistsHtml = '';
    if (artists.length === 0) {
      artistsHtml = '<p>Nenhum artista vinculado.</p>';
    } else {
      artists.forEach(item => {
        artistsHtml += `
          <div class="ticket-row">
            <span>${item.artist?.name}</span>
            <span>${item.artist?.musicGenre || 'Gênero não informado'}</span>
            <span>${item.artist?.biography?.slice(0, 70) || 'Sem biografia'}</span>
            <span></span>
          </div>
        `;
      });
    }

    container.innerHTML = `
      <section class="panel detail-head">
        <div>
          <span class="pill">${event.category}</span>
          <h1>${event.title}</h1>
          <p>${event.description}</p>
          <p><strong>Data:</strong> ${formattedDate} às ${event.time}</p>
          <p><strong>Status:</strong> ${event.status}</p>
          <p><strong>Local:</strong> ${event.location?.name || ''} - ${event.location?.city || ''}</p>
          <div class="toolbar wrap">
            <button class="outline-btn" id="btn-favorite">Favoritar evento</button>
            <a class="ghost-btn" href="/ranking" data-link>Ver ranking</a>
          </div>
        </div>

        <aside class="price-box">
          <span>Valor do ingresso</span>
          <h2>R$ ${price}</h2>
          <input type="number" min="1" value="1" id="input-quantity" />
          <button id="btn-buy">Comprar Ingressos</button>
        </aside>
      </section>

      <section class="panel">
        <h3>Artistas confirmados</h3>
        ${artistsHtml}
      </section>

      <section class="panel" id="tickets-section">
        <h3>Meus ingressos para este evento</h3>
        ${ticketsHtml}
      </section>
    `;

    // Events
    container.querySelector('#btn-favorite').addEventListener('click', async () => {
      try {
        await api.post(`/users/favorites/${id}`);
        alert('Favorito atualizado.');
      } catch (err) {
        alert('Faça login para favoritar.');
      }
    });

    container.querySelector('#btn-buy').addEventListener('click', () => {
      const quantity = container.querySelector('#input-quantity').value;
      window.appRouter.navigate(`/checkout/${id}?quantity=${quantity}`);
    });

    // Delegated events for tickets
    container.querySelector('#tickets-section').addEventListener('click', async (e) => {
      if (e.target.classList.contains('btn-pay')) {
        const ticketId = e.target.closest('.ticket-row').dataset.id;
        try {
          await api.post('/tickets/pay', { ticketId });
          alert('Ingresso pago com sucesso.');
          // Reload view manually
          window.appRouter.navigate(window.location.pathname);
        } catch (err) {
          alert('Falha ao pagar ingresso.');
        }
      } else if (e.target.classList.contains('btn-cancel')) {
        const ticketId = e.target.closest('.ticket-row').dataset.id;
        try {
          await api.post('/tickets/cancel', { ticketId });
          alert('Ingresso cancelado.');
          // Reload view manually
          window.appRouter.navigate(window.location.pathname);
        } catch (err) {
          alert('Falha ao cancelar ingresso.');
        }
      }
    });

  } catch (err) {
    container.innerHTML = '<div class="panel danger">Erro ao carregar evento.</div>';
  }

  return container;
}
