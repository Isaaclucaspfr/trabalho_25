import { useState } from 'react';
import { useToast } from '../context/ToastContext';

export default function ContactPage() {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      toast.success('Mensagem enviada com sucesso! Entraremos em contato em breve.');
      setLoading(false);
      e.target.reset();
    }, 1500);
  };

  return (
    <div className="container">
      <div className="section-head" style={{ marginTop: '2rem' }}>
        <h1>Fale Conosco</h1>
        <p>Estamos aqui para ajudar. Envie sua dúvida ou sugestão e responderemos rapidamente.</p>
      </div>

      <div className="dashboard-grid" style={{ marginTop: '2rem' }}>
        <form className="panel" onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1.2rem' }}>
            <div>
              <label style={{ fontWeight: 600 }}>Seu Nome</label>
              <input type="text" required placeholder="Ex: Maria Silva" style={{ width: '100%', marginTop: '0.4rem' }} />
            </div>
            <div>
              <label style={{ fontWeight: 600 }}>Seu E-mail</label>
              <input type="email" required placeholder="maria@email.com" style={{ width: '100%', marginTop: '0.4rem' }} />
            </div>
            <div>
              <label style={{ fontWeight: 600 }}>Assunto</label>
              <select required style={{ width: '100%', marginTop: '0.4rem' }}>
                <option value="">Selecione um assunto</option>
                <option value="duvida">Dúvida sobre compra</option>
                <option value="produtor">Sou Produtor de Eventos</option>
                <option value="parceria">Parcerias</option>
                <option value="outro">Outro</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 600 }}>Mensagem</label>
              <textarea className="text-area" required placeholder="Escreva sua mensagem aqui..." style={{ width: '100%', marginTop: '0.4rem', minHeight: '120px' }}></textarea>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" disabled={loading} style={{ minWidth: '160px' }}>
                {loading ? 'Enviando...' : 'Enviar Mensagem'}
              </button>
            </div>
          </div>
        </form>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="panel" style={{ background: 'var(--ink)', color: 'white' }}>
            <h3 style={{ marginBottom: '1rem', color: '#cbd5e1' }}>Informações de Contato</h3>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
              📍 <span>Av. Paulista, 1000 - São Paulo, SP</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
              📧 <span>contato@eventhub.com.br</span>
            </p>
            <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0.5rem 0' }}>
              📞 <span>(11) 4002-8922</span>
            </p>
          </div>
          <div className="panel" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '1rem' }}>
            <span style={{ fontSize: '3rem' }}>💬</span>
            <h3 style={{ margin: 0 }}>Atendimento 24/7</h3>
            <p className="muted" style={{ textAlign: 'center', fontSize: '0.9rem' }}>Nossa equipe de suporte está sempre pronta para ajudar você.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
