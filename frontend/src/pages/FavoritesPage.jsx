import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/users/favorites');
      setFavorites(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const removeFavorite = async (eventId) => {
    try {
      await api.post(`/users/favorites/${eventId}`);
      toast.info('Evento removido dos favoritos.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao atualizar favorito.'));
    }
  };

  if (loading) return <div className="container page-loading">Carregando favoritos...</div>;

  return (
    <div className="container">
      <section className="section-head">
        <h1>Favoritos</h1>
        <p>Seus eventos preferidos em um unico lugar.</p>
      </section>

      {favorites.length === 0 && (
        <div className="panel">
          Nenhum evento favoritado.
          <div className="toolbar"><Link to="/events" className="ghost-btn">Explorar catalogo</Link></div>
        </div>
      )}

      <section className="grid">
        {favorites.map((favorite) => (
          <article key={favorite.eventId} className="panel">
            <h3>{favorite.event.title}</h3>
            <p>{favorite.event.description}</p>
            <div className="toolbar">
              <Link className="ghost-btn" to={`/events/${favorite.eventId}`}>Abrir detalhes</Link>
              <button className="outline-btn" onClick={() => removeFavorite(favorite.eventId)}>Remover</button>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
