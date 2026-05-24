import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import EventCard from '../components/EventCard';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function HomePage() {
  const toast = useToast();
  const [highlighted, setHighlighted] = useState([]);
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [eventsRes, rankingRes] = await Promise.all([
          api.get('/events', { params: { highlighted: true, limit: 4, sortBy: 'eventDate' } }),
          api.get('/ranking/eventos')
        ]);
        setHighlighted(eventsRes.data.data || []);
        setRanking((rankingRes.data || []).slice(0, 5));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const onFavorite = async (eventId) => {
    try {
      await api.post(`/users/favorites/${eventId}`);
      toast.success('Favorito atualizado.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Faca login para favoritar eventos.'));
    }
  };

  return (
    <div className="container">
      <section className="hero home-hero">
        <div>
          <h1>EventHub</h1>
          <p>Um sistema completo para descobrir eventos, acompanhar ranking em tempo real e controlar ingressos.</p>
          <div className="hero-actions">
            <Link to="/events" className="hero-btn">Explorar eventos</Link>
            <Link to="/ranking" className="hero-btn ghost">Ver ranking</Link>
          </div>
        </div>
        <div className="hero-stats">
          <article>
            <h3>{highlighted.length}</h3>
            <span>Eventos em destaque</span>
          </article>
          <article>
            <h3>{ranking.length}</h3>
            <span>No ranking popular</span>
          </article>
          <article>
            <h3>24/7</h3>
            <span>Reservas online</span>
          </article>
        </div>
      </section>

      <section className="section-head">
        <h2>Destaques da semana</h2>
        <Link to="/events">Ver catalogo completo</Link>
      </section>

      {loading && <div className="skeleton-grid">{Array.from({ length: 4 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div>}
      {!loading && highlighted.length === 0 && <div className="panel">Ainda nao ha eventos em destaque.</div>}

      <section className="grid">
        {highlighted.map((event) => <EventCard key={event.id} event={event} onFavorite={onFavorite} />)}
      </section>

      <section className="panel ranking-preview">
        <div className="section-head compact">
          <h2>Top 5 populares</h2>
          <Link to="/ranking">Abrir ranking completo</Link>
        </div>
        {ranking.map((item, index) => (
          <div key={item.eventId} className="rank-row">
            <strong>#{index + 1}</strong>
            <span>{item.title}</span>
            <span>Score: {item.popularityScore}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
