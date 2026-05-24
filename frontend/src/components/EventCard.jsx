import { Link } from 'react-router-dom';

function formatPrice(value) {
  return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

export default function EventCard({ event, onFavorite }) {
  const img = event.image ? `http://localhost:4000${event.image}` : `https://picsum.photos/seed/${event.id}/640/420`;

  return (
    <article className="card lift event-card">
      <div className="card-image-wrap">
        <img src={img} alt={event.title} loading="lazy" />
        <div className="card-image-overlay">
          <span>{new Date(event.eventDate).toLocaleDateString('pt-BR')}</span>
          <span>{event.time}</span>
        </div>
      </div>
      <div className="card-body">
        <div className="pill-row">
          <span className="pill">{event.category}</span>
          {event.highlighted && <span className="pill success">Destaque</span>}
          <span className={`pill status ${String(event.status).toLowerCase()}`}>{event.status}</span>
        </div>
        <h3>{event.title}</h3>
        <p>{event.description.slice(0, 110)}...</p>
        <div className="meta-row">
          <small>{event.location?.city || 'Cidade nao informada'}</small>
          <strong>{formatPrice(event.price)}</strong>
        </div>
        <div className="card-actions">
          <Link className="ghost-btn" to={`/events/${event.id}`}>Detalhes</Link>
          <button className="outline-btn" onClick={() => onFavorite(event.id)}>Favoritar</button>
        </div>
      </div>
    </article>
  );
}
