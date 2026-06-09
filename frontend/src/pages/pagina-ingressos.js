import api from '../api/cliente-api.js';
import { requireAuth } from '../context/sessao-autenticacao.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';
import { formatCurrency, formatDate, showToast } from '../utils/auxiliares-interface.js';

const statusLabels = { PAID: 'Pago', RESERVED: 'Reservado', PENDING: 'Pendente', CANCELED: 'Cancelado' };

export async function TicketsPage() {
  const container = document.createElement('div');
  container.className = 'container';
  if (!requireAuth()) return container;

  const load = async () => {
    container.innerHTML = '<div class="page-loading">Carregando ingressos...</div>';
    try {
      const { data: tickets } = await api.get('/tickets/my');
      container.innerHTML = `
        <section class="section-head">
          <div><h1>Meus Ingressos</h1><p>Acompanhe reservas, pagamentos e códigos de acesso.</p></div>
          <a href="/events" class="ghost-btn" data-link>Comprar ingressos</a>
        </section>
        <div class="ticket-list" id="ticket-list">
          ${tickets.map((ticket) => `
            <article class="panel ticket-card" data-id="${ticket.id}">
              <div>
                <div class="pill-row">
                  <span class="pill status ${ticket.status.toLowerCase()}">${statusLabels[ticket.status] || ticket.status}</span>
                  <span class="pill">${ticket.quantity} ingresso(s)</span>
                </div>
                <h2>${ticket.event?.title || 'Evento'}</h2>
                <p>${formatDate(ticket.event?.eventDate)} às ${ticket.event?.time || '-'}</p>
                <code>${ticket.code}</code>
              </div>
              <div class="ticket-summary">
                <strong>${formatCurrency(ticket.totalValue)}</strong>
                <div class="row-actions">
                  <a class="ghost-btn" href="/events/${ticket.eventId}" data-link>Ver evento</a>
                  ${ticket.status === 'RESERVED' ? '<button data-action="pay">Pagar</button>' : ''}
                  ${!['CANCELED', 'PAID'].includes(ticket.status) ? '<button class="outline-btn" data-action="cancel">Cancelar</button>' : ''}
                </div>
              </div>
            </article>
          `).join('') || '<div class="panel empty-state"><h2>Você ainda não possui ingressos</h2><p>Escolha um evento e conclua sua primeira compra.</p></div>'}
        </div>
      `;
    } catch (error) {
      container.innerHTML = `<div class="panel danger">${getErrorMessage(error, 'Não foi possível carregar os ingressos.')}</div>`;
    }
  };

  container.addEventListener('click', async (event) => {
    const action = event.target.dataset.action;
    if (!action) return;
    const ticketId = event.target.closest('[data-id]').dataset.id;
    event.target.disabled = true;
    try {
      await api.post(`/tickets/${action}`, { ticketId });
      showToast(action === 'pay' ? 'Pagamento confirmado.' : 'Ingresso cancelado.');
      await load();
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
      event.target.disabled = false;
    }
  });

  await load();
  return container;
}
