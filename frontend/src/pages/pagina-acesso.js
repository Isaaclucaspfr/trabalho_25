import { loginApi, registerApi } from '../context/sessao-autenticacao.js';

export function LoginPage() {
  const main = document.createElement('main');
  main.className = 'auth';

  let mode = 'login';

  const render = () => {
    main.innerHTML = `
      <form class="panel auth-card" id="auth-form">
        <span class="pill">EventHub Access</span>
        <h2>${mode === 'login' ? 'Entrar na plataforma' : 'Criar nova conta'}</h2>

        ${mode === 'register' ? `
          <input
            id="name-input"
            placeholder="Nome completo"
            required
          />
        ` : ''}

        <input
          id="email-input"
          type="email"
          value="admin@eventhub.com"
          placeholder="Email"
          required
        />

        <input
          id="password-input"
          type="password"
          value="123456"
          placeholder="Senha"
          required
        />

        <button type="submit" id="submit-btn">
          ${mode === 'login' ? 'Acessar sistema' : 'Cadastrar conta'}
        </button>

        <button
          type="button"
          class="ghost-btn"
          id="toggle-mode-btn"
        >
          ${mode === 'login' ? 'Não possui conta? Cadastre-se' : 'Já possui conta? Entrar'}
        </button>
      </form>
    `;

    const toggleBtn = main.querySelector('#toggle-mode-btn');
    toggleBtn.addEventListener('click', () => {
      mode = mode === 'login' ? 'register' : 'login';
      render();
    });

    const form = main.querySelector('#auth-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector('#submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Processando...';

      const email = form.querySelector('#email-input').value;
      const password = form.querySelector('#password-input').value;

      try {
        if (mode === 'register') {
          const name = form.querySelector('#name-input').value;
          await registerApi(name, email, password);
          alert('Conta criada com sucesso.');
        } else {
          await loginApi(email, password);
          alert('Login realizado.');
        }

        window.location.href = '/'; // Redirect to home and reload
      } catch (err) {
        alert('Falha na autenticação.');
        console.error(err);
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = mode === 'login' ? 'Acessar sistema' : 'Cadastrar conta';
        }
      }
    });
  };

  render();

  return main;
}
