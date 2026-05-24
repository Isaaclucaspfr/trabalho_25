import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, admin = false }) {
  const { user, isAdmin, authLoading } = useAuth();
  const location = useLocation();

  if (authLoading) return <div className="page-loading">Carregando sessao...</div>;
  if (!user) return <Navigate to="/login" replace state={{ redirectTo: location.pathname }} />;
  if (admin && !isAdmin) return <Navigate to="/" replace />;

  return children;
}
