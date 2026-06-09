import api from '../api/cliente-api.js';

export async function RankingPage() {
  const container = document.createElement('div');
  container.className = 'container';

  container.innerHTML = `
    <section class="section-head">
      <h1>Ranking de Popularidade</h1>
      <p>Score calculado por vendas, favoritos, visualizações e engajamento.</p>
    </section>
    <div id="ranking-content">
      <div class="skeleton-grid">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>
  `;

  try {
    const { data } = await api.get('/ranking/eventos');
    const ranking = data || [];
    const content = container.querySelector('#ranking-content');

    if (ranking.length === 0) {
      content.innerHTML = '<div class="panel">Sem dados de ranking no momento.</div>';
    } else {
      content.innerHTML = '';
      ranking.forEach((item, index) => {
        content.innerHTML += `
          <article class="panel rank-card">
            <div class="rank-pos">#${index + 1}</div>
            <div>
              <h3>${item.title}</h3>
              <p>Score geral: <strong>${item.popularityScore}</strong></p>
            </div>
            <div class="rank-metrics">
              <span>Vendidos: ${item.sold}</span>
              <span>Favoritos: ${item.favorites}</span>
              <span>Views: ${item.views}</span>
              <span>Engajamento: ${Number(item.engagementRate * 100).toFixed(0)}%</span>
            </div>
          </article>
        `;
      });
    }
  } catch (err) {
    container.querySelector('#ranking-content').innerHTML = '<div class="panel danger">Não foi possível carregar o ranking.</div>';
  }

  return container;
}
