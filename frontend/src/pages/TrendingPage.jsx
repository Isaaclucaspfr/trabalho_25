import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function TrendingPage() {
  const [activeTab, setActiveTab] = useState('artists');
  const [loading, setLoading] = useState(true);
  const [artists, setArtists] = useState([]);
  const [albums, setAlbums] = useState([]);
  const toast = useToast();

  useEffect(() => {
    const loadTrending = async () => {
      setLoading(true);
      try {
        const [artistsRes, albumsRes] = await Promise.all([
          api.get('/artists/trending'),
          api.get('/albums/trending')
        ]);
        setArtists(artistsRes.data || []);
        setAlbums(albumsRes.data || []);
      } catch (err) {
        toast.error(getErrorMessage(err, 'Falha ao carregar tendencias.'));
      } finally {
        setLoading(false);
      }
    };

    loadTrending();
  }, [toast]);

  return (
    <div className="container">
      <div className="section-head" style={{ marginTop: '2rem' }}>
        <h1>Em Alta</h1>
        <p>Descubra artistas e albuns populares com dados reais da plataforma.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem', marginBottom: '2rem' }}>
        <button
          className={activeTab === 'artists' ? '' : 'ghost-btn'}
          onClick={() => setActiveTab('artists')}
          style={{ minWidth: '150px' }}
        >
          Artistas em Alta
        </button>
        <button
          className={activeTab === 'albums' ? '' : 'ghost-btn'}
          onClick={() => setActiveTab('albums')}
          style={{ minWidth: '150px' }}
        >
          Albuns em Alta
        </button>
      </div>

      {loading && <div className="panel">Carregando tendencias...</div>}

      {!loading && activeTab === 'artists' && (
        <div className="grid">
          {artists.length === 0 && <div className="panel">Nenhum artista em alta no momento.</div>}
          {artists.map((artist, index) => (
            <div key={artist.id} className="card lift" style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="rank-pos" style={{ minWidth: '40px', minHeight: '40px', fontSize: '1rem', borderRadius: '10px' }}>
                  {index + 1}
                </span>
                <img src={artist.image} alt={artist.name} style={{ width: '64px', height: '64px', borderRadius: '50%', objectFit: 'cover' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{artist.name}</h3>
                  <span className="muted" style={{ fontSize: '0.85rem' }}>{artist.genre}</span>
                </div>
              </div>

              <div className="meta-row" style={{ marginTop: '0.5rem', borderTop: '1px solid var(--line)', paddingTop: '0.75rem' }}>
                <div>
                  <span className="muted" style={{ display: 'block', fontSize: '0.8rem' }}>Ouvintes mensais</span>
                  <strong>{artist.listeners}</strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span className="muted" style={{ display: 'block', fontSize: '0.8rem' }}>Crescimento</span>
                  <strong style={{ color: artist.change?.startsWith('+') ? 'var(--success)' : 'var(--danger)' }}>
                    {artist.change}
                  </strong>
                </div>
              </div>

              <div style={{ borderTop: '1px solid var(--line)', paddingTop: '0.75rem' }}>
                <span className="muted" style={{ display: 'block', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
                  Festivais em que vai participar
                </span>
                {(artist.festivals || []).length === 0 && (
                  <span className="muted" style={{ fontSize: '0.9rem' }}>Nenhum festival publicado.</span>
                )}
                {(artist.festivals || []).map((festival) => (
                  <div key={festival.eventId} style={{ marginBottom: '0.35rem' }}>
                    <Link to={`/events/${festival.eventId}`}>
                      {festival.title}
                    </Link>
                    <span className="muted" style={{ marginLeft: '0.4rem', fontSize: '0.85rem' }}>
                      {new Date(festival.eventDate).toLocaleDateString('pt-BR')} as {festival.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && activeTab === 'albums' && (
        <div className="grid">
          {albums.length === 0 && <div className="panel">Nenhum album em alta no momento.</div>}
          {albums.map((album, index) => (
            <div key={album.id} className="card lift">
              <div className="card-image-wrap">
                <img src={album.cover} alt={album.title} style={{ height: '220px' }} />
                <div className="card-image-overlay">
                  <span style={{ background: 'var(--accent)', color: 'white' }}>#{index + 1} Top Album</span>
                </div>
              </div>
              <div className="card-body">
                <h3>{album.title}</h3>
                <p style={{ minHeight: 'auto', marginBottom: '0.5rem' }}>{album.artist}</p>
                <div className="meta-row">
                  <span className="pill">{album.streams} streams</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

