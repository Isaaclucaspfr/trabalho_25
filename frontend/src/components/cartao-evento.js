import { assetUrl } from '../utils/auxiliares-interface.js';

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export function createEventCard(event, onFavorite) {
  const img = event.image ? assetUrl(event.image) : `https://picsum.photos/seed/${event.id}/640/420`;

  const article = document.createElement('article');
  article.className = 'card lift event-card';

  const formattedDate = new Date(event.eventDate).toLocaleDateString('pt-BR');
  const city = event.location?.city || 'Cidade nao informada';
  const price = formatPrice(event.price);

  article.innerHTML = `
    <div class="card-image-wrap">
      <img src="${img}" alt="${event.title}" loading="lazy" />
      <div class="card-image-overlay">
        <span>${formattedDate}</span>
        <span>${event.time}</span>
      </div>
    </div>
    <div class="card-body">
      <div class="pill-row">
        <span class="pill">${event.category}</span>
        ${event.highlighted ? '<span class="pill success">Destaque</span>' : ''}
        <span class="pill status ${String(event.status).toLowerCase()}">${event.status}</span>
      </div>
      <h3>${event.title}</h3>
      <p>${event.description.slice(0, 110)}...</p>
      <div class="meta-row">
        <small>${city}</small>
        <strong>${price}</strong>
      </div>
      <div class="card-actions">
        <a class="ghost-btn" href="/events/${event.id}" data-link>Detalhes</a>
        <button class="outline-btn favorite-btn">Favoritar</button>
      </div>
    </div>
  `;

  const btn = article.querySelector('.favorite-btn');
  btn.addEventListener('click', () => onFavorite(event.id));

  return article;
}
