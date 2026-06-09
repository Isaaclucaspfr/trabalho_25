import api from '../api/cliente-api.js';
import { assetUrl } from '../utils/auxiliares-interface.js';

export async function TrendingPage() {
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = '<div class="page-loading">Carregando destaques...</div>';

  try {
    const [artistsRes, albumsRes] = await Promise.all([
      api.get('/artists/trending'),
      api.get('/albums/trending')
    ]);
    const artists = artistsRes.data || [];
    const albums = albumsRes.data || [];

    container.innerHTML = `
      <section class="section-head">
        <div><h1>Em Alta</h1><p>Artistas, lançamentos e festivais que estão movimentando a plataforma.</p></div>
      </section>
      <section class="panel">
        <h2>Artistas em destaque</h2>
        <div class="trending-grid">
          ${artists.map((artist, index) => `
            <article class="artist-card">
              <span class="rank-badge">#${index + 1}</span>
              <img src="${assetUrl(artist.image)}" alt="${artist.name}">
              <div>
                <h3>${artist.name}</h3>
                <p>${artist.genre}</p>
                <strong>${artist.listeners} ouvintes</strong>
                <span class="trend-change">${artist.change}</span>
              </div>
              ${artist.festivals?.length ? `
                <div class="festival-list">
                  ${artist.festivals.map((festival) => `
                    <a href="/events/${festival.eventId}" data-link>${festival.title}</a>
                  `).join('')}
                </div>` : ''}
            </article>
          `).join('') || '<p>Nenhum artista disponível.</p>'}
        </div>
      </section>
      <section class="panel">
        <h2>Álbuns populares</h2>
        <div class="album-grid">
          ${albums.map((album) => `
            <article class="album-card">
              <img src="${assetUrl(album.cover)}" alt="${album.title}">
              <h3>${album.title}</h3>
              <p>${album.artist}</p>
              <strong>${album.streams} streams</strong>
            </article>
          `).join('') || '<p>Nenhum álbum disponível.</p>'}
        </div>
      </section>
    `;
  } catch {
    container.innerHTML = '<div class="panel danger">Não foi possível carregar os destaques.</div>';
  }
  return container;
}
