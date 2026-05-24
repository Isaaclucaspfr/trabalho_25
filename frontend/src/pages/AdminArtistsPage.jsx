import { useEffect, useState } from 'react';
import api from '../api/client';
import AdminManageNav from '../components/AdminManageNav';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

const initialForm = {
  name: '',
  biography: '',
  musicGenre: '',
  instagram: '',
  youtube: ''
};

export default function AdminArtistsPage() {
  const toast = useToast();
  const [artists, setArtists] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  const fetchArtists = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/artists');
      setArtists(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArtists();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      const socialLinks = {};
      if (form.instagram) socialLinks.instagram = form.instagram;
      if (form.youtube) socialLinks.youtube = form.youtube;

      await api.post('/artists', {
        name: form.name,
        biography: form.biography,
        musicGenre: form.musicGenre,
        socialLinks
      });

      toast.success('Artista cadastrado.');
      setForm(initialForm);
      await fetchArtists();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao cadastrar artista.'));
    }
  };

  const removeArtist = async (artistId) => {
    try {
      await api.delete(`/artists/${artistId}`);
      toast.info('Artista removido.');
      await fetchArtists();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao remover artista.'));
    }
  };

  if (loading) return <div className="container page-loading">Carregando artistas...</div>;

  return (
    <div className="container">
      <AdminManageNav />

      <section className="section-head">
        <h1>Gestao de Artistas</h1>
        <p>Cadastre artistas e mantenha o lineup atualizado.</p>
      </section>

      <form className="panel" onSubmit={submit}>
        <h3>Novo artista</h3>
        <div className="form-grid">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome" required />
          <input value={form.musicGenre} onChange={(e) => setForm((f) => ({ ...f, musicGenre: e.target.value }))} placeholder="Genero musical" />
          <input value={form.instagram} onChange={(e) => setForm((f) => ({ ...f, instagram: e.target.value }))} placeholder="Instagram" />
          <input value={form.youtube} onChange={(e) => setForm((f) => ({ ...f, youtube: e.target.value }))} placeholder="YouTube" />
        </div>
        <textarea className="text-area" value={form.biography} onChange={(e) => setForm((f) => ({ ...f, biography: e.target.value }))} placeholder="Biografia" />
        <div className="toolbar">
          <button type="submit">Cadastrar artista</button>
          <button type="button" className="ghost-btn" onClick={fetchArtists}>Atualizar</button>
        </div>
      </form>

      <section className="panel">
        <h3>Artistas cadastrados</h3>
        {artists.length === 0 && <p>Nenhum artista cadastrado.</p>}
        {artists.map((artist) => (
          <div key={artist.id} className="ticket-row">
            <div>
              <strong>{artist.name}</strong>
              <small>{artist.musicGenre || 'Genero nao informado'}</small>
            </div>
            <span>{artist.biography?.slice(0, 55) || 'Sem biografia'}</span>
            <span />
            <div className="row-actions">
              <button className="outline-btn" onClick={() => removeArtist(artist.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
