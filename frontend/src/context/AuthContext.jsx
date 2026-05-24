import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => JSON.parse(localStorage.getItem('user') || 'null'));
  const [authLoading, setAuthLoading] = useState(true);

  const persist = (payload) => {
    localStorage.setItem('token', payload.accessToken);
    localStorage.setItem('refreshToken', payload.refreshToken);
    localStorage.setItem('user', JSON.stringify(payload.user));
    setUser(payload.user);
  };

  const register = async (name, email, password) => {
    await api.post('/auth/register', { name, email, password });
    await login(email, password);
  };

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    persist(data);
  };

  const refreshMe = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setAuthLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/users/me');
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch {
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
    } finally {
      setAuthLoading(false);
    }
  };

  useEffect(() => {
    refreshMe();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    login,
    register,
    logout,
    refreshMe,
    authLoading,
    isAdmin: user?.role === 'ADMIN'
  }), [user, authLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
