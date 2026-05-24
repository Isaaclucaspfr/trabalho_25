import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import api from '../api/client';
import AdminManageNav from '../components/AdminManageNav';

const colors = ['#0f4c5c', '#2a9d8f', '#ffb703', '#fb8500', '#d62828'];

export default function AdminDashboardPage() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard/metrics').then((res) => setData(res.data));
  }, []);

  if (!data) return <div className="container page-loading">Carregando dashboard administrativo...</div>;

  const categories = data.charts.categories.map((item) => ({ name: item.category, total: item._count._all }));

  return (
    <div className="container">
      <AdminManageNav />

      <section className="section-head">
        <h1>Dashboard Administrativo</h1>
        <p>Visao executiva de operacao, receita e performance dos eventos.</p>
      </section>

      <section className="admin-shortcuts">
        <Link to="/admin/manage/events" className="panel shortcut">Gerenciar eventos</Link>
        <Link to="/admin/manage/artists" className="panel shortcut">Gerenciar artistas</Link>
        <Link to="/admin/manage/locations" className="panel shortcut">Gerenciar locais</Link>
      </section>

      <div className="stats">
        <div className="panel"><small>Total de usuarios</small><h2>{data.totalUsers}</h2></div>
        <div className="panel"><small>Total de eventos</small><h2>{data.totalEvents}</h2></div>
        <div className="panel"><small>Ingressos vendidos</small><h2>{data.totalTicketsSold}</h2></div>
        <div className="panel"><small>Receita total</small><h2>R$ {Number(data.totalRevenue).toFixed(2)}</h2></div>
      </div>

      <div className="dashboard-grid">
        <div className="panel" style={{ height: 320 }}>
          <h3>Eventos por categoria</h3>
          <ResponsiveContainer width="100%" height="85%">
            <BarChart data={categories}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="total" fill="#2a9d8f" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="panel" style={{ height: 320 }}>
          <h3>Distribuicao de categorias</h3>
          <ResponsiveContainer width="100%" height="85%">
            <PieChart>
              <Pie data={categories} dataKey="total" nameKey="name" outerRadius={110}>
                {categories.map((_, index) => <Cell key={index} fill={colors[index % colors.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <section className="panel">
        <h3>Eventos mais populares</h3>
        {data.topEvents.map((event) => (
          <div key={event.id} className="ticket-row">
            <strong>{event.title}</strong>
            <span>Tickets: {event._count.tickets}</span>
            <span>Favoritos: {event._count.favorites}</span>
            <span>Views: {event._count.views}</span>
          </div>
        ))}
      </section>
    </div>
  );
}
