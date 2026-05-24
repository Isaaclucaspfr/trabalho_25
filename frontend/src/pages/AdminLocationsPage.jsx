import { useEffect, useState } from 'react';
import api from '../api/client';
import AdminManageNav from '../components/AdminManageNav';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

const initialForm = {
  name: '',
  address: '',
  city: '',
  state: '',
  zipCode: '',
  maxCapacity: 1000,
  description: '',
  latitude: '',
  longitude: ''
};

export default function AdminLocationsPage() {
  const toast = useToast();
  const [locations, setLocations] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(true);

  const fetchLocations = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/locations');
      setLocations(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/locations', {
        ...form,
        maxCapacity: Number(form.maxCapacity),
        latitude: form.latitude ? Number(form.latitude) : undefined,
        longitude: form.longitude ? Number(form.longitude) : undefined
      });
      toast.success('Local cadastrado.');
      setForm(initialForm);
      await fetchLocations();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao cadastrar local.'));
    }
  };

  const removeLocation = async (locationId) => {
    try {
      await api.delete(`/locations/${locationId}`);
      toast.info('Local removido.');
      await fetchLocations();
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha ao remover local.'));
    }
  };

  if (loading) return <div className="container page-loading">Carregando locais...</div>;

  return (
    <div className="container">
      <AdminManageNav />

      <section className="section-head">
        <h1>Gestao de Locais</h1>
        <p>Controle capacidade, endereco e dados de infraestrutura.</p>
      </section>

      <form className="panel" onSubmit={submit}>
        <h3>Novo local</h3>
        <div className="form-grid">
          <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Nome do local" required />
          <input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} placeholder="Endereco" required />
          <input value={form.city} onChange={(e) => setForm((f) => ({ ...f, city: e.target.value }))} placeholder="Cidade" required />
          <input value={form.state} onChange={(e) => setForm((f) => ({ ...f, state: e.target.value }))} placeholder="Estado" required />
          <input value={form.zipCode} onChange={(e) => setForm((f) => ({ ...f, zipCode: e.target.value }))} placeholder="CEP" required />
          <input type="number" value={form.maxCapacity} onChange={(e) => setForm((f) => ({ ...f, maxCapacity: e.target.value }))} placeholder="Capacidade maxima" required />
          <input value={form.latitude} onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))} placeholder="Latitude (opcional)" />
          <input value={form.longitude} onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))} placeholder="Longitude (opcional)" />
        </div>
        <textarea className="text-area" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Descricao" />
        <div className="toolbar">
          <button type="submit">Cadastrar local</button>
          <button type="button" className="ghost-btn" onClick={fetchLocations}>Atualizar</button>
        </div>
      </form>

      <section className="panel">
        <h3>Locais cadastrados</h3>
        {locations.length === 0 && <p>Nenhum local cadastrado.</p>}
        {locations.map((location) => (
          <div key={location.id} className="ticket-row">
            <div>
              <strong>{location.name}</strong>
              <small>{location.city} - {location.state}</small>
            </div>
            <span>Capacidade: {location.maxCapacity}</span>
            <span>{location.zipCode}</span>
            <div className="row-actions">
              <button className="outline-btn" onClick={() => removeLocation(location.id)}>Excluir</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
