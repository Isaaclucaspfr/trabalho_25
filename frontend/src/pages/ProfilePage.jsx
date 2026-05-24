import { useEffect, useState } from 'react';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function ProfilePage() {
  const { refreshMe } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({ favorites: 0, tickets: 0 });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [meRes, favoritesRes, ticketsRes] = await Promise.all([
        api.get('/users/me'),
        api.get('/users/favorites').catch(() => ({ data: [] })),
        api.get('/tickets/my').catch(() => ({ data: [] }))
      ]);

      setProfile({
        name: meRes.data.name,
        email: meRes.data.email,
        role: meRes.data.role,
        avatar: meRes.data.avatar
      });

      setStats({ favorites: favoritesRes.data.length, tickets: ticketsRes.data.length });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Nao foi possivel carregar seu perfil.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    try {
      await api.put('/users/me', { name: profile.name, email: profile.email });
      await refreshMe();
      toast.success('Perfil atualizado com sucesso.');
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao atualizar perfil.'));
    } finally {
      setSaving(false);
    }
  };

  const uploadAvatar = async (file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      await api.post('/users/me/avatar', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      toast.success('Avatar atualizado.');
      await refreshMe();
      await load();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao enviar avatar.'));
    }
  };

  if (loading) return <div className="container page-loading">Carregando perfil...</div>;
  if (!profile) return <div className="container panel">Nao foi possivel carregar seu perfil.</div>;

  const avatarUrl = profile.avatar ? `http://localhost:4000${profile.avatar}` : 'https://picsum.photos/seed/profile/300/300';

  return (
    <div className="container">
      <section className="section-head">
        <h1>Meu Perfil</h1>
        <p>Gerencie dados pessoais e acompanhe sua atividade.</p>
      </section>

      <section className="profile-grid">
        <article className="panel">
          <h3>Informacoes pessoais</h3>
          <div className="toolbar wrap">
            <img src={avatarUrl} alt="Avatar" className="avatar-preview" />
            <input value={profile.name} onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))} />
            <input value={profile.email} onChange={(e) => setProfile((p) => ({ ...p, email: e.target.value }))} />
            <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
            <button onClick={saveProfile} disabled={saving}>{saving ? 'Salvando...' : 'Salvar alteracoes'}</button>
          </div>
          <p><strong>Permissao:</strong> {profile.role}</p>
        </article>

        <article className="panel">
          <h3>Resumo da conta</h3>
          <div className="stats stats-single-col">
            <div className="mini-stat">
              <span>Favoritos</span>
              <strong>{stats.favorites}</strong>
            </div>
            <div className="mini-stat">
              <span>Ingressos emitidos</span>
              <strong>{stats.tickets}</strong>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
