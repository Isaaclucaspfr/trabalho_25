import { useEffect, useState } from 'react';
import api from '../api/client';
import { getErrorMessage } from '../utils/errorMessage';

export default function RankingPage() {
  const [ranking, setRanking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/ranking/eventos');
        setRanking(data || []);
      } catch (err) {
        setError(getErrorMessage(err, 'Nao foi possivel carregar o ranking.'));
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="container">
      <section className="section-head">
        <h1>Ranking de Popularidade</h1>
        <p>Score calculado por vendas, favoritos, visualizacoes e engajamento.</p>
      </section>

      {loading && <div className="skeleton-grid">{Array.from({ length: 5 }).map((_, i) => <div className="skeleton-card" key={i} />)}</div>}
      {error && <div className="panel danger">{error}</div>}
      {!loading && !error && ranking.length === 0 && <div className="panel">Sem dados de ranking no momento.</div>}

      {!loading && !error && ranking.map((item, index) => (
        <article key={item.eventId} className="panel rank-card">
          <div className="rank-pos">#{index + 1}</div>
          <div>
            <h3>{item.title}</h3>
            <p>Score geral: <strong>{item.popularityScore}</strong></p>
          </div>
          <div className="rank-metrics">
            <span>Vendidos: {item.sold}</span>
            <span>Favoritos: {item.favorites}</span>
            <span>Views: {item.views}</span>
            <span>Engajamento: {Number(item.engagementRate * 100).toFixed(0)}%</span>
          </div>
        </article>
      ))}
    </div>
  );
}
