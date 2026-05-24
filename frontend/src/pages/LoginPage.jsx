import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../utils/errorMessage';

export default function LoginPage() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: 'admin@eventhub.com', password: '123456' });
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        await register(form.name, form.email, form.password);
        toast.success('Conta criada com sucesso.');
      } else {
        await login(form.email, form.password);
        toast.success('Login realizado.');
      }

      const redirectTo = location.state?.redirectTo || '/';
      navigate(redirectTo, { replace: true });
    } catch (err) {
      toast.error(getErrorMessage(err, 'Falha na autenticacao.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth">
      <form onSubmit={submit} className="panel auth-card">
        <span className="pill">EventHub Access</span>
        <h2>{mode === 'login' ? 'Entrar na plataforma' : 'Criar nova conta'}</h2>

        {mode === 'register' && (
          <input
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Nome completo"
            required
          />
        )}

        <input
          value={form.email}
          type="email"
          onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
          placeholder="Email"
          required
        />

        <input
          value={form.password}
          type="password"
          onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
          placeholder="Senha"
          required
        />

        <button type="submit" disabled={loading}>
          {loading ? 'Processando...' : mode === 'login' ? 'Acessar sistema' : 'Cadastrar conta'}
        </button>

        <button
          type="button"
          className="ghost-btn"
          onClick={() => setMode((prev) => (prev === 'login' ? 'register' : 'login'))}
        >
          {mode === 'login' ? 'Nao possui conta? Cadastre-se' : 'Ja possui conta? Entrar'}
        </button>
      </form>
    </main>
  );
}
