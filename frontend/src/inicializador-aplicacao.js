import './styles/estilos-aplicacao.css';
import { Router } from './roteador-cliente.js';
import { createHeader } from './components/cabecalho-site.js';
import { HomePage } from './pages/pagina-inicial.js';
import { LoginPage } from './pages/pagina-acesso.js';
import { EventCatalogPage } from './pages/pagina-catalogo-eventos.js';
import { EventDetailPage } from './pages/pagina-detalhes-evento.js';
import { RankingPage } from './pages/pagina-classificacao.js';
import { TrendingPage } from './pages/pagina-em-alta.js';
import { AboutPage } from './pages/pagina-sobre.js';
import { ContactPage } from './pages/pagina-contato.js';
import { FavoritesPage } from './pages/pagina-favoritos.js';
import { TicketsPage } from './pages/pagina-ingressos.js';
import { ProfilePage } from './pages/pagina-perfil.js';
import { CheckoutPage } from './pages/pagina-finalizar-compra.js';
import { AdminDashboardPage } from './pages/pagina-painel-administrativo.js';
import { AdminEventsPage } from './pages/pagina-gerenciar-eventos.js';
import { refreshMe } from './context/sessao-autenticacao.js';

const root = document.getElementById('root');

/**
 * Monta a estrutura permanente da SPA e registra todas as paginas no roteador.
 *
 * A sessao e sincronizada antes da renderizacao para que o cabecalho seja
 * criado com os links corretos de usuario e administrador.
 *
 * @returns {Promise<void>}
 */
async function initApp() {
  await refreshMe();

  const header = createHeader();
  root.appendChild(header);

  const mainContent = document.createElement('main');
  mainContent.id = 'app-content';
  root.appendChild(mainContent);

  // Strings representam caminhos exatos; RegExp representa URLs com parametros.
  const routes = [
    { path: '/', component: HomePage },
    { path: '/login', component: LoginPage },
    { path: '/events', component: EventCatalogPage },
    { path: /^\/events\/[^/]+$/, component: EventDetailPage },
    { path: /^\/checkout\/[^/]+$/, component: CheckoutPage },
    { path: '/ranking', component: RankingPage },
    { path: '/trending', component: TrendingPage },
    { path: '/about', component: AboutPage },
    { path: '/contact', component: ContactPage },
    { path: '/favorites', component: FavoritesPage },
    { path: '/tickets', component: TicketsPage },
    { path: '/profile', component: ProfilePage },
    { path: '/admin', component: AdminDashboardPage },
    { path: '/admin/manage/events', component: AdminEventsPage }
  ];

  const router = new Router(routes, mainContent);
  // Algumas paginas usam esta instancia para navegar depois de uma acao.
  window.appRouter = router;
  router.init();
}

initApp();
