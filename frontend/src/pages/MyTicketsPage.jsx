import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function MyTicketsPage() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const toast = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/tickets/my');
      setTickets(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (statusFilter === 'ALL') return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const pay = async (ticketId) => {
    try {
      await api.post('/tickets/pay', { ticketId });
      toast.success('Pagamento confirmado.');
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

  if (loading) return <div className="container page-loading">Carregando ingressos...</div>;

  return (
    <div className="container">
      <section className="section-head">
        <h1>Meus ingressos</h1>
        <p>Acompanhe reservas, pagamentos e cancelamentos.</p>
      </section>

      <section className="panel">
        <div className="toolbar wrap">
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="ALL">Todos</option>
            <option value="RESERVED">Reservados</option>
            <option value="PAID">Pagos</option>
            <option value="CANCELED">Cancelados</option>
          </select>
          <button className="ghost-btn" onClick={load}>Atualizar lista</button>
        </div>
      </section>

      {filtered.length === 0 && <div className="panel">Nenhum ingresso para este filtro.</div>}

      <section className="panel">
        {filtered.map((ticket) => (
          <div key={ticket.id} className="ticket-row">
            <div>
              <strong>{ticket.event?.title}</strong>
              <small>{new Date(ticket.createdAt).toLocaleDateString('pt-BR')}</small>
            </div>
            <span>Qtd: {ticket.quantity}</span>
            <span className={`pill status ${String(ticket.status).toLowerCase()}`}>{ticket.status}</span>
            <div className="row-actions">
              <strong>R$ {Number(ticket.totalValue).toFixed(2)}</strong>
              {ticket.status === 'RESERVED' && <button onClick={() => pay(ticket.id)}>Pagar</button>}
              {ticket.status !== 'CANCELED' && <button className="outline-btn" onClick={() => cancel(ticket.id)}>Cancelar</button>}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
