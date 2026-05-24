import { useEffect, useState } from 'react';
import api from '../api/client';
import EventCard from '../components/EventCard';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function EventCatalogPage() {
  const [events, setEvents] = useState([]);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: '',
    highlighted: '',
    sortBy: 'eventDate'
  });
  const [page, setPage] = useState(1);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const toast = useToast();

  const fetchEvents = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const params = {
        ...filters,
        page: nextPage,
        limit: 9,
        sortOrder: 'desc'
      };
      if (filters.highlighted === '') delete params.highlighted;
      if (!filters.status) delete params.status;
      if (!filters.category) delete params.category;
      if (!filters.search) delete params.search;

      const { data } = await api.get('/events', { params });
      setEvents(data.data || []);
      setMeta(data.meta || { page: nextPage, totalPages: 1 });
      setPage(nextPage);
    } catch (err) {
      setError(getErrorMessage(err, 'Nao foi possivel carregar o catalogo.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(1);
  }, []);

  const onFavorite = async (eventId) => {
    try {
      await api.post(`/users/favorites/${eventId}`);
      toast.success('Favorito atualizado.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Faca login para favoritar um evento.'));
    }
  };

  return (
    <div className="container">
      <section className="section-head">
        <h1>Catalogo de Eventos</h1>
        <p>Encontre por categoria, status e ordene da forma que preferir.</p>
      </section>

      <section className="panel">
        <div className="toolbar wrap">
          <input
            value={filters.search}
            onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))}
            placeholder="Buscar por titulo"
          />
          <input
            value={filters.category}
            onChange={(e) => setFilters((f) => ({ ...f, category: e.target.value }))}
            placeholder="Categoria"
          />
          <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
            <option value="">Todos os status</option>
            <option value="PUBLISHED">Publicado</option>
            <option value="DRAFT">Rascunho</option>
            <option value="SOLD_OUT">Esgotado</option>
            <option value="CANCELED">Cancelado</option>
          </select>
          <select value={filters.highlighted} onChange={(e) => setFilters((f) => ({ ...f, highlighted: e.target.value }))}>
            <option value="">Todos</option>
            <option value="true">Somente destaque</option>
            <option value="false">Sem destaque</option>
          </select>
          <select value={filters.sortBy} onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value }))}>
            <option value="eventDate">Data do evento</option>
            <option value="createdAt">Criacao</option>
            <option value="price">Preco</option>
            <option value="title">Titulo</option>
          </select>
          <button onClick={() => fetchEvents(1)}>Aplicar filtros</button>
        </div>
      </section>

      {loading && <div className="skeleton-grid">{Array.from({ length: 6 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div>}
      {!loading && error && <div className="panel danger">{error}</div>}
      {!loading && !error && events.length === 0 && <div className="panel">Nenhum evento encontrado.</div>}

      <section className="grid">
        {events.map((event) => (
          <EventCard key={event.id} event={event} onFavorite={onFavorite} />
        ))}
      </section>

      <div className="pagination">
        <button disabled={page <= 1} onClick={() => fetchEvents(page - 1)}>Anterior</button>
        <span>Pagina {meta.page || 1} de {meta.totalPages || 1}</span>
        <button disabled={page >= (meta.totalPages || 1)} onClick={() => fetchEvents(page + 1)}>Proxima</button>
      </div>
    </div>
  );
}
