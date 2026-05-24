import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom';
import HomePage from './pages/HomePage';
import EventCatalogPage from './pages/EventCatalogPage';
import RankingPage from './pages/RankingPage';
import LoginPage from './pages/LoginPage';
import EventDetailPage from './pages/EventDetailPage';
import CheckoutPage from './pages/CheckoutPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import TrendingPage from './pages/TrendingPage';
import FavoritesPage from './pages/FavoritesPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import MyTicketsPage from './pages/MyTicketsPage';
import ProfilePage from './pages/ProfilePage';
import AdminEventsPage from './pages/AdminEventsPage';
import AdminArtistsPage from './pages/AdminArtistsPage';
import AdminLocationsPage from './pages/AdminLocationsPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuth } from './context/AuthContext';

const active = ({ isActive }) => (isActive ? 'nav-link active' : 'nav-link');

export default function App() {
  const { user, logout, isAdmin } = useAuth();

  return (
    <BrowserRouter>
      <header className="topbar">
        <NavLink to="/" className="logo">EventHub</NavLink>

        <nav className="main-nav">
          <NavLink to="/events" className={active}>Explorar</NavLink>
          <NavLink to="/trending" className={active}>Em Alta</NavLink>
          <NavLink to="/ranking" className={active}>Ranking</NavLink>
          <NavLink to="/about" className={active}>Sobre Nós</NavLink>
          <NavLink to="/contact" className={active}>Contato</NavLink>
          {user && <NavLink to="/favorites" className={active}>Favoritos</NavLink>}
          {user && <NavLink to="/tickets" className={active}>Ingressos</NavLink>}
          {user && <NavLink to="/profile" className={active}>Perfil</NavLink>}
          {isAdmin && <NavLink to="/admin" className={active}>Dashboard</NavLink>}
          {isAdmin && <NavLink to="/admin/manage/events" className={active}>Gestao</NavLink>}
        </nav>

        <div className="auth-nav">
          {user ? <button onClick={logout}>Sair</button> : <NavLink to="/login" className="nav-link">Login</NavLink>}
        </div>
      </header>

      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventCatalogPage />} />
        <Route path="/ranking" element={<RankingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/events/:id" element={<EventDetailPage />} />
        <Route path="/checkout/:eventId" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/trending" element={<TrendingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route path="/favorites" element={<ProtectedRoute><FavoritesPage /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><MyTicketsPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        <Route path="/admin" element={<ProtectedRoute admin><AdminDashboardPage /></ProtectedRoute>} />
        <Route path="/admin/manage/events" element={<ProtectedRoute admin><AdminEventsPage /></ProtectedRoute>} />
        <Route path="/admin/manage/artists" element={<ProtectedRoute admin><AdminArtistsPage /></ProtectedRoute>} />
        <Route path="/admin/manage/locations" element={<ProtectedRoute admin><AdminLocationsPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
