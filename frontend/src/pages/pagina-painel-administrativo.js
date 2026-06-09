import api from '../api/cliente-api.js';
import { requireAdmin } from '../context/sessao-autenticacao.js';
import { formatCurrency } from '../utils/auxiliares-interface.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';

export async function AdminDashboardPage() {
  const container = document.createElement('div');
  container.className = 'container';
  if (!requireAdmin()) return container;
  container.innerHTML = '<div class="page-loading">Carregando indicadores...</div>';

  try {
    const { data } = await api.get('/dashboard/metrics');
    const categories = data.charts?.categories || [];
    const maxCategory = Math.max(...categories.map((item) => item._count._all), 1);
    container.innerHTML = `
      <section class="section-head">
        <div><h1>Dashboard Administrativo</h1><p>Visão geral do desempenho da plataforma.</p></div>
        <a href="/admin/manage/events" class="hero-btn" data-link>Gerenciar eventos</a>
      </section>
      <section class="stats">
        <article class="panel metric-card"><span>Usuários</span><strong>${data.totalUsers}</strong></article>
        <article class="panel metric-card"><span>Eventos</span><strong>${data.totalEvents}</strong></article>
        <article class="panel metric-card"><span>Vendas pagas</span><strong>${data.totalTicketsSold}</strong></article>
        <article class="panel metric-card"><span>Receita</span><strong>${formatCurrency(data.totalRevenue)}</strong></article>
      </section>
      <section class="dashboard-grid">
        <article class="panel">
          <h2>Eventos com mais pedidos</h2>
          <div class="data-list">
            ${data.topEvents.map((event, index) => `
              <a href="/events/${event.id}" data-link class="data-row">
                <strong>#${index + 1} ${event.title}</strong>
                <span>${event._count.tickets} pedidos · ${event._count.favorites} favoritos · ${event._count.views} views</span>
              </a>
            `).join('') || '<p>Sem dados disponíveis.</p>'}
          </div>
        </article>
        <article class="panel">
          <h2>Eventos por categoria</h2>
          <div class="bar-chart">
            ${categories.map((item) => `
              <div class="bar-row">
                <div><span>${item.category}</span><strong>${item._count._all}</strong></div>
                <i style="width:${(item._count._all / maxCategory) * 100}%"></i>
              </div>
            `).join('') || '<p>Sem categorias cadastradas.</p>'}
          </div>
        </article>
      </section>
      <section class="admin-shortcuts">
        <a href="/admin/manage/events" class="panel shortcut" data-link>Eventos</a>
        <a href="/ranking" class="panel shortcut" data-link>Ranking público</a>
        <a href="/contact" class="panel shortcut" data-link>Central de contato</a>
      </section>
    `;
  } catch (error) {
    container.innerHTML = `<div class="panel danger">${getErrorMessage(error, 'Não foi possível carregar o dashboard.')}</div>`;
  }
  return container;
}
