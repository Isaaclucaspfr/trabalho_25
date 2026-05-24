import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import AdminManageNav from '../components/AdminManageNav';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

const initialForm = {
  title: '',
  description: '',
  eventDate: '',
  time: '20:00',
  category: '',
  capacity: 100,
  status: 'PUBLISHED',
  price: 100,
  locationId: '',
  highlighted: false,
  artistIds: []
};

export default function AdminEventsPage() {
  const toast = useToast();
  const [events, setEvents] = useState([]);
  const [artists, setArtists] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(initialForm);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, artistsRes, locationsRes] = await Promise.all([
        api.get('/events', { params: { limit: 50, sortBy: 'createdAt' } }),
        api.get('/artists'),
        api.get('/locations')
      ]);

      const list = eventsRes.data.data || [];
      setEvents(list);
      setArtists(artistsRes.data || []);
      setLocations(locationsRes.data || []);

      if (!form.locationId && locationsRes.data?.[0]?.id) {
        setForm((prev) => ({ ...prev, locationId: locationsRes.data[0].id }));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const selectedArtists = useMemo(() => new Set(form.artistIds), [form.artistIds]);

  const toggleArtist = (artistId) => {
    setForm((prev) => ({
      ...prev,
      artistIds: prev.artistIds.includes(artistId)
        ? prev.artistIds.filter((id) => id !== artistId)
        : [...prev.artistIds, artistId]
    }));
  };

  const createEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form,
        capacity: Number(form.capacity),
        price: Number(form.price),
        highlighted: Boolean(form.highlighted)
      };

      await api.post('/events', payload);
      toast.success('Evento criado com sucesso.');
      setForm((prev) => ({ ...initialForm, locationId: prev.locationId || '' }));
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao criar evento.'));
    }
  };

  const deleteEvent = async (eventId) => {
    try {
      await api.delete(`/events/${eventId}`);
      toast.info('Evento removido com soft delete.');
      await fetchData();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao remover evento.'));
    }
  };

  if (loading) return <div className="container page-loading">Carregando gestao de eventos...</div>;

  return (
    <div className="container">
      <AdminManageNav />

      <section className="section-head">
        <h1>Gestao de Eventos</h1>
        <p>Cadastro, vinculacao de artistas e controle operacional.</p>
      </section>

      <form className="panel" onSubmit={createEvent}>
        <h3>Novo evento</h3>
        <div className="form-grid">
          <input value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} placeholder="Titulo" required />
          <input value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} placeholder="Categoria" required />
          <input type="date" value={form.eventDate} onChange={(e) => setForm((f) => ({ ...f, eventDate: e.target.value }))} required />
          <input value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))} placeholder="Horario (20:00)" required />
          <input type="number" value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: e.target.value }))} placeholder="Capacidade" required />
          <input type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} placeholder="Preco" required />
          <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
            <option value="DRAFT">DRAFT</option>
            <option value="PUBLISHED">PUBLISHED</option>
            <option value="SOLD_OUT">SOLD_OUT</option>
            <option value="CANCELED">CANCELED</option>
          </select>
          <select value={form.locationId} onChange={(e) => setForm((f) => ({ ...f, locationId: e.target.value }))}>
            {locations.map((location) => (
              <option key={location.id} value={location.id}>{location.name} - {location.city}</option>
            ))}
          </select>
        </div>

        <textarea
          className="text-area"
          value={form.description}
          onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
          placeholder="Descricao do evento"
          required
        />

        <label className="check-row">
          <input type="checkbox" checked={form.highlighted} onChange={(e) => setForm((f) => ({ ...f, highlighted: e.target.checked }))} />
          Evento em destaque
        </label>

        <div className="artist-tags">
          {artists.map((artist) => (
            <button
              key={artist.id}
              type="button"
              className={selectedArtists.has(artist.id) ? 'tag active' : 'tag'}
              onClick={() => toggleArtist(artist.id)}
            >
              {artist.name}
            </button>
          ))}
        </div>

        <div className="toolbar">
          <button type="submit">Cadastrar evento</button>
          <button type="button" className="ghost-btn" onClick={fetchData}>Atualizar lista</button>
        </div>
      </form>

      <section className="panel">
        <h3>Eventos cadastrados</h3>
        {events.length === 0 && <p>Nenhum evento cadastrado.</p>}
        {events.map((event) => (
          <div key={event.id} className="ticket-row">
            <div>
              <strong>{event.title}</strong>
              <small>{new Date(event.eventDate).toLocaleDateString('pt-BR')}</small>
            </div>
            <span>{event.category}</span>
            <span className={`pill status ${String(event.status).toLowerCase()}`}>{event.status}</span>
            <div className="row-actions">
              <strong>R$ {Number(event.price).toFixed(2)}</strong>
              <button className="outline-btn" onClick={() => deleteEvent(event.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
