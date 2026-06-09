import api from '../api/cliente-api.js';
import { getUser, requireAuth } from '../context/sessao-autenticacao.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';
import { assetUrl, setButtonLoading, showToast } from '../utils/auxiliares-interface.js';

export function ProfilePage() {
  const container = document.createElement('div');
  container.className = 'container';
  if (!requireAuth()) return container;
  const user = getUser();
  const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0f7d7e&color=fff`;

  container.innerHTML = `
    <section class="section-head"><div><h1>Meu Perfil</h1><p>Atualize seus dados e sua imagem de apresentação.</p></div></section>
    <div class="profile-grid">
      <form class="panel stacked-form" id="profile-form">
        <h2>Dados pessoais</h2>
        <label>Nome<input name="name" value="${user.name}" required minlength="3"></label>
        <label>E-mail<input name="email" type="email" value="${user.email}" required></label>
        <label>Tipo de conta<input value="${user.role === 'ADMIN' ? 'Administrador' : 'Usuário'}" disabled></label>
        <button type="submit">Salvar alterações</button>
      </form>
      <form class="panel avatar-form" id="avatar-form">
        <h2>Foto de perfil</h2>
        <img class="profile-avatar" src="${user.avatar ? assetUrl(user.avatar) : fallbackAvatar}" alt="${user.name}">
        <input type="file" name="avatar" accept="image/*" required>
        <button type="submit">Enviar nova foto</button>
      </form>
    </div>
  `;

  const profileForm = container.querySelector('#profile-form');
  profileForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = profileForm.querySelector('button');
    setButtonLoading(button, true);
    try {
      const { data } = await api.put('/users/me', Object.fromEntries(new FormData(profileForm)));
      localStorage.setItem('user', JSON.stringify(data));
      showToast('Perfil atualizado.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setButtonLoading(button, false);
    }
  });

  const avatarForm = container.querySelector('#avatar-form');
  avatarForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = avatarForm.querySelector('button');
    setButtonLoading(button, true, 'Enviando...');
    try {
      const { data } = await api.post('/users/me/avatar', new FormData(avatarForm));
      localStorage.setItem('user', JSON.stringify(data));
      container.querySelector('.profile-avatar').src = assetUrl(data.avatar);
      showToast('Foto atualizada.');
    } catch (error) {
      showToast(getErrorMessage(error), 'error');
    } finally {
      setButtonLoading(button, false);
    }
  });
  return container;
}
