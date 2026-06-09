/**
 * Roteador client-side minimo baseado na History API.
 *
 * Cada componente de rota pode devolver um HTMLElement ou uma string HTML.
 * Links internos precisam do atributo `data-link` para evitar o reload total.
 */
export class Router {
  /**
   * @param {Array<{path: string|RegExp, component: Function}>} routes
   * @param {HTMLElement} contentElement Elemento que recebe a pagina ativa.
   */
  constructor(routes, contentElement) {
    this.routes = routes;
    this.contentElement = contentElement;

    window.addEventListener('popstate', () => this.handleRoute());

    // A delegacao cobre inclusive links criados depois da inicializacao.
    document.body.addEventListener('click', e => {
      if (e.target.matches('[data-link]')) {
        e.preventDefault();
        this.navigate(e.target.getAttribute('href'));
      }
    });
  }

  /** Renderiza a rota correspondente a URL atual. */
  init() {
    this.handleRoute();
  }

  /**
   * Adiciona uma entrada ao historico e renderiza a nova pagina.
   * @param {string} path Caminho interno, incluindo query string quando houver.
   */
  navigate(path) {
    window.history.pushState({}, '', path);
    this.handleRoute();
  }

  /**
   * Localiza e executa o componente associado ao pathname atual.
   * Caminhos desconhecidos usam a pagina inicial como fallback.
   *
   * @returns {Promise<void>}
   */
  async handleRoute() {
    let path = window.location.pathname;

    // Expressoes regulares permitem rotas com parametros, como /events/123.
    let match = this.routes.find(route => {
      if (route.path instanceof RegExp) {
        return route.path.test(path);
      }
      return route.path === path;
    });

    if (!match) {
      match = this.routes.find(route => route.path === '/');
    }

    if (match && match.component) {
      this.contentElement.innerHTML = '';

      // O await tambem funciona para componentes sincronos.
      const component = await match.component();

      if (component instanceof HTMLElement) {
        this.contentElement.appendChild(component);
      } else if (typeof component === 'string') {
        this.contentElement.innerHTML = component;
      }
    }
  }
}
