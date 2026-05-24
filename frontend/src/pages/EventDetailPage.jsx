import { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [myTickets, setMyTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [eventRes, ticketsRes] = await Promise.all([
        api.get(`/events/${id}`),
        api.get('/tickets/my').catch(() => ({ data: [] }))
      ]);

      setEvent(eventRes.data);
      setMyTickets((ticketsRes.data || []).filter((ticket) => ticket.eventId === id));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handleBuy = () => {
    navigate(`/checkout/${id}?quantity=${quantity}`);
  };

  const pay = async (ticketId) => {
    try {
      await api.post('/tickets/pay', { ticketId });
      toast.success('Ingresso pago com sucesso.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao pagar ingresso.'));
    }
  };

  const cancel = async (ticketId) => {
    try {
      await api.post('/tickets/cancel', { ticketId });
      toast.info('Ingresso cancelado.');
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao cancelar ingresso.'));
    }
  };

  const favorite = async () => {
    try {
      await api.post(`/users/favorites/${id}`);
      toast.success('Favorito atualizado.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Faca login para favoritar.'));
    }
  };

  if (loading) return <div className="container page-loading">Carregando detalhes do evento...</div>;
  if (!event) return <div className="container panel">Evento nao encontrado.</div>;

  const artists = event.artists || [];

  return (
    <div className="container">
      <section className="panel detail-head">
        <div>
          <span className="pill">{event.category}</span>
          <h1>{event.title}</h1>
          <p>{event.description}</p>
          <p><strong>Data:</strong> {new Date(event.eventDate).toLocaleDateString('pt-BR')} as {event.time}</p>
          <p><strong>Status:</strong> {event.status}</p>
          <p><strong>Local:</strong> {event.location?.name} - {event.location?.city}</p>
          <div className="toolbar wrap">
            <button className="outline-btn" onClick={favorite}>Favoritar evento</button>
            <Link className="ghost-btn" to="/ranking">Ver ranking</Link>
          </div>
        </div>

        <aside className="price-box">
          <span>Valor do ingresso</span>
          <h2>R$ {Number(event.price).toFixed(2)}</h2>
          <input type="number" min="1" value={quantity} onChange={(e) => setQuantity(e.target.value)} />
          <button onClick={handleBuy}>Comprar Ingressos</button>
        </aside>
      </section>

      <section className="panel">
        <h3>Artistas confirmados</h3>
        {artists.length === 0 && <p>Nenhum artista vinculado.</p>}
        {artists.map((item) => (
          <div key={item.artistId} className="ticket-row">
            <span>{item.artist?.name}</span>
            <span>{item.artist?.musicGenre || 'Genero nao informado'}</span>
            <span>{item.artist?.biography?.slice(0, 70) || 'Sem biografia'}</span>
            <span />
          </div>
        ))}
      </section>

      <section className="panel">
        <h3>Meus ingressos para este evento</h3>
        {myTickets.length === 0 && <p>Voce ainda nao possui ingressos deste evento.</p>}
        {myTickets.map((ticket) => (
          <div key={ticket.id} className="ticket-row">
            <span>{ticket.code}</span>
            <span>Qtd: {ticket.quantity}</span>
            <span>Status: {ticket.status}</span>
            <div className="row-actions">
              {ticket.status === 'RESERVED' && <button onClick={() => pay(ticket.id)}>Pagar</button>}
              {ticket.status !== 'CANCELED' && <button className="outline-btn" onClick={() => cancel(ticket.id)}>Cancelar</button>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
