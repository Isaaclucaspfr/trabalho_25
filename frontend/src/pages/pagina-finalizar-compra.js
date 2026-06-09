import api from '../api/cliente-api.js';
import { requireAuth } from '../context/sessao-autenticacao.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';
import { formatCurrency, setButtonLoading, showToast } from '../utils/auxiliares-interface.js';

export async function CheckoutPage() {
  const container = document.createElement('div');
  container.className = 'container';
  if (!requireAuth()) return container;
  const eventId = window.location.pathname.split('/').pop();
  const quantity = Math.max(1, Number(new URLSearchParams(window.location.search).get('quantity')) || 1);
  container.innerHTML = '<div class="page-loading">Preparando checkout...</div>';

  try {
    const { data: event } = await api.get(`/events/${eventId}`);
    container.innerHTML = `
      <section class="section-head"><div><h1>Finalizar compra</h1><p>Revise o pedido e informe os dados para pagamento.</p></div></section>
      <div class="checkout-grid">
        <form class="panel stacked-form" id="checkout-form">
          <h2>Dados do cartão</h2>
          <label>Nome no cartão<input name="cardName" required minlength="2" value="Cliente EventHub"></label>
          <label>Número do cartão<input name="cardNumber" inputmode="numeric" required minlength="12" value="4111111111111111"></label>
          <div class="two-columns">
            <label>Validade<input name="expiry" required minlength="4" placeholder="MM/AA" value="12/30"></label>
            <label>CVV<input name="cvv" inputmode="numeric" required minlength="3" maxlength="4" value="123"></label>
          </div>
          <button type="submit">Pagar ${formatCurrency(Number(event.price) * quantity)}</button>
        </form>
        <aside class="panel order-summary">
          <span class="pill">${event.category}</span>
          <h2>${event.title}</h2>
          <p>${quantity} ingresso(s) × ${formatCurrency(event.price)}</p>
          <hr>
          <div><span>Total</span><strong>${formatCurrency(Number(event.price) * quantity)}</strong></div>
        </aside>
      </div>
    `;

    const form = container.querySelector('#checkout-form');
    form.addEventListener('submit', async (submitEvent) => {
      submitEvent.preventDefault();
      const button = form.querySelector('button');
      setButtonLoading(button, true, 'Processando pagamento...');
      try {
        const cardDetails = Object.fromEntries(new FormData(form));
        const { data } = await api.post('/tickets/checkout', { eventId, quantity, cardDetails });
        showToast(data.message, data.success ? 'success' : 'info');
        window.appRouter.navigate('/tickets');
      } catch (error) {
        showToast(getErrorMessage(error, 'Pagamento não aprovado.'), 'error');
      } finally {
        setButtonLoading(button, false);
      }
    });
  } catch (error) {
    container.innerHTML = `<div class="panel danger">${getErrorMessage(error, 'Não foi possível abrir o checkout.')}</div>`;
  }
  return container;
}
