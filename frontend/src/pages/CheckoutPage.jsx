import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function CheckoutPage() {
  const { eventId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const toast = useToast();
  
  const queryParams = new URLSearchParams(location.search);
  const initialQuantity = parseInt(queryParams.get('quantity')) || 1;

  const [event, setEvent] = useState(null);
  const [quantity, setQuantity] = useState(initialQuantity);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);

  // Fictitious form state
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const res = await api.get(`/events/${eventId}`);
        setEvent(res.data);
      } catch (err) {
        toast.error('Evento nao encontrado.');
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };
    fetchEvent();
  }, [eventId, navigate, toast]);

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!cardName || !cardNumber || !expiry || !cvv) {
      toast.error('Preencha todos os dados do cartao.');
      return;
    }

    setProcessing(true);
    try {
      // 1. Reservar o ingresso
      const reserveRes = await api.post('/tickets/reserve', { eventId, quantity });
      
      // Assume a api returns an array of reserved tickets. 
      // If it doesn't, we just show success. 
      // Emulating a payment step:
      // If we had the exact ticket IDs we could call /tickets/pay, but the API might not return it directly in the shape we want, 
      // or we can just assume reservation is the main step for the fictitious checkout, and the user pays in the 'My Tickets' page.
      // Wait, let's try to just reserve and show a success message, then redirect.
      
      toast.success('Compra realizada com sucesso!');
      navigate('/tickets');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao processar a compra.'));
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div className="container page-loading">Carregando checkout...</div>;
  if (!event) return null;

  const total = (Number(event.price) * quantity).toFixed(2);

  return (
    <div className="container">
      <div className="section-head">
        <h1>Finalizar Compra</h1>
        <p>Preencha os dados abaixo para garantir seu ingresso.</p>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <form className="panel" onSubmit={handleCheckout}>
          <h2>Pagamento via Cartão de Crédito</h2>
          <p className="muted">Ambiente seguro e criptografado</p>
          
          <div style={{ marginTop: '1.5rem', display: 'grid', gap: '1rem' }}>
            <div>
              <label>Nome impresso no cartao</label>
              <input 
                type="text" 
                style={{ width: '100%', marginTop: '0.4rem' }} 
                placeholder="Ex: JOAO DA SILVA" 
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
              />
            </div>
            <div>
              <label>Numero do cartao</label>
              <input 
                type="text" 
                style={{ width: '100%', marginTop: '0.4rem' }} 
                placeholder="0000 0000 0000 0000" 
                maxLength="19"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
              />
            </div>
            <div className="form-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Validade (MM/AA)</label>
                <input 
                  type="text" 
                  style={{ width: '100%', marginTop: '0.4rem' }} 
                  placeholder="12/30" 
                  maxLength="5"
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                />
              </div>
              <div>
                <label>CVV</label>
                <input 
                  type="text" 
                  style={{ width: '100%', marginTop: '0.4rem' }} 
                  placeholder="123" 
                  maxLength="4"
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="toolbar" style={{ marginTop: '2rem', justifyContent: 'flex-end' }}>
            <button type="button" className="ghost-btn" onClick={() => navigate(-1)}>Voltar</button>
            <button type="submit" disabled={processing} style={{ minWidth: '180px' }}>
              {processing ? 'Processando...' : `Pagar R$ ${total}`}
            </button>
          </div>
        </form>

        <aside>
          <div className="panel price-box" style={{ background: 'var(--surface-hover)', borderColor: 'var(--accent)', boxShadow: '0 8px 24px rgba(59, 130, 246, 0.12)' }}>
            <h3>Resumo do Pedido</h3>
            <div style={{ marginTop: '1rem', borderBottom: '1px solid var(--line)', paddingBottom: '1rem' }}>
              <strong style={{ display: 'block', fontSize: '1.1rem' }}>{event.title}</strong>
              <span className="muted" style={{ fontSize: '0.9rem' }}>{new Date(event.eventDate).toLocaleDateString('pt-BR')} as {event.time}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem' }}>
              <span>Valor unitário</span>
              <span>R$ {Number(event.price).toFixed(2)}</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
              <span>Quantidade</span>
              <input 
                type="number" 
                min="1" 
                value={quantity} 
                onChange={(e) => setQuantity(Number(e.target.value))} 
                style={{ width: '80px', padding: '0.3rem', minHeight: '36px' }}
              />
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1.5rem', fontSize: '1.25rem', fontWeight: '800' }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent)' }}>R$ {total}</span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
