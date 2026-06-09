import api from '../api/cliente-api.js';

/** @returns {object|null} Usuario persistido na sessao local. */
export function getUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

/** @returns {string|null} Access token usado nas requisicoes autenticadas. */
export function getToken() {
  return localStorage.getItem('token');
}

/** @returns {boolean} Indica se o usuario atual possui o papel ADMIN. */
export function isAdmin() {
  const user = getUser();
  return user ? user.role === 'ADMIN' : false;
}

/**
 * Persiste o resultado completo do login.
 * @param {{accessToken: string, refreshToken: string, user: object}} payload
 */
export function persist(payload) {
  localStorage.setItem('token', payload.accessToken);
  localStorage.setItem('refreshToken', payload.refreshToken);
  localStorage.setItem('user', JSON.stringify(payload.user));
}

/** Autentica e persiste a nova sessao. */
export async function loginApi(email, password) {
  const { data } = await api.post('/auth/login', { email, password });
  persist(data);
}

/** Cadastra o usuario e inicia a sessao automaticamente. */
export async function registerApi(name, email, password) {
  await api.post('/auth/register', { name, email, password });
  await loginApi(email, password);
}

/**
 * Confirma que o token salvo ainda e valido e atualiza os dados do usuario.
 * Uma falha remove a sessao para impedir que a interface use dados obsoletos.
 */
export async function refreshMe() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const { data } = await api.get('/users/me');
    localStorage.setItem('user', JSON.stringify(data));
  } catch {
    logout();
  }
}

/** Remove todos os dados locais relacionados a autenticacao. */
export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
}

// Usado para redirecionar usuários não logados
export function requireAuth() {
  if (!getUser()) {
    window.location.href = '/login';
    return false;
  }
  return true;
}

// Usado para redirecionar não-admins
export function requireAdmin() {
  if (!requireAuth()) return false;

  if (!isAdmin()) {
    window.location.href = '/';
    return false;
  }
  return true;
}
