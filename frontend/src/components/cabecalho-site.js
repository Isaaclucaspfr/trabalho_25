import { getUser, logout, isAdmin } from '../context/sessao-autenticacao.js';

export function createHeader() {
  const header = document.createElement('header');
  header.className = 'topbar';

  header.innerHTML = `
    <a href="/" class="logo" data-link>EventHub</a>
    <nav class="main-nav">
      <a href="/events" class="nav-link" data-link>Explorar</a>
      <a href="/trending" class="nav-link" data-link>Em Alta</a>
      <a href="/ranking" class="nav-link" data-link>Ranking</a>
      <a href="/about" class="nav-link" data-link>Sobre Nós</a>
      <a href="/contact" class="nav-link" data-link>Contato</a>
    </nav>
    <div class="auth-nav"></div>
  `;

  const nav = header.querySelector('.main-nav');
  const authNav = header.querySelector('.auth-nav');

  const user = getUser();
  const admin = isAdmin();

  if (user) {
    nav.innerHTML += `
      <a href="/favorites" class="nav-link" data-link>Favoritos</a>
      <a href="/tickets" class="nav-link" data-link>Ingressos</a>
      <a href="/profile" class="nav-link" data-link>Perfil</a>
    `;

    if (admin) {
      nav.innerHTML += `
        <a href="/admin" class="nav-link" data-link>Dashboard</a>
        <a href="/admin/manage/events" class="nav-link" data-link>Gestão</a>
      `;
    }

    const logoutBtn = document.createElement('button');
    logoutBtn.textContent = 'Sair';
    logoutBtn.addEventListener('click', () => {
      logout();
      window.location.href = '/login'; // Force full reload or use router navigate
    });
    authNav.appendChild(logoutBtn);
  } else {
    authNav.innerHTML = `<a href="/login" class="nav-link" data-link>Login</a>`;
  }

  // Set active link visually based on current path
  const updateActiveLink = () => {
    const path = window.location.pathname;
    header.querySelectorAll('.nav-link').forEach(link => {
      const href = link.getAttribute('href');
      if (href === path || (href === '/events' && path.startsWith('/events/'))) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  };

  window.addEventListener('popstate', updateActiveLink);
  // setTimeout to let router navigate
  document.body.addEventListener('click', (e) => {
    if (e.target.matches('[data-link]')) {
      setTimeout(updateActiveLink, 0);
    }
  });
  updateActiveLink();

  return header;
}
