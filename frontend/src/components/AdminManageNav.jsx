import { NavLink } from 'react-router-dom';

const linkClass = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

export default function AdminManageNav() {
  return (
    <div className="panel admin-nav-strip">
      <NavLink to="/admin" className={linkClass}>Visao geral</NavLink>
      <NavLink to="/admin/manage/events" className={linkClass}>Eventos</NavLink>
      <NavLink to="/admin/manage/artists" className={linkClass}>Artistas</NavLink>
      <NavLink to="/admin/manage/locations" className={linkClass}>Locais</NavLink>
    </div>
  );
}
