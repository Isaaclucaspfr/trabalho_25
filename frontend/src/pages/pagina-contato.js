import api from '../api/cliente-api.js';
import { getUser } from '../context/sessao-autenticacao.js';
import { getErrorMessage } from '../utils/mensagem-erro-api.js';
import { setButtonLoading, showToast } from '../utils/auxiliares-interface.js';

export function ContactPage() {
  const user = getUser();
  const container = document.createElement('div');
  container.className = 'container';
  container.innerHTML = `
    <section class="section-head">
      <div><h1>Fale com a gente</h1><p>Dúvidas, sugestões ou suporte com uma compra.</p></div>
    </section>
    <div class="contact-grid">
      <form class="panel stacked-form" id="contact-form">
        <label>Nome<input name="name" value="${user?.name || ''}" required minlength="2"></label>
        <label>E-mail<input name="email" type="email" value="${user?.email || ''}" required></label>
        <label>Assunto<input name="subject" required minlength="3" placeholder="Como podemos ajudar?"></label>
        <label>Mensagem<textarea class="text-area" name="message" required minlength="10" placeholder="Conte os detalhes da sua solicitação"></textarea></label>
        <button type="submit">Enviar mensagem</button>
      </form>
      <aside class="panel contact-aside">
        <span class="pill">Suporte EventHub</span>
        <h2>Estamos por perto.</h2>
        <p>Nossa equipe analisa cada solicitação e responde pelo e-mail informado.</p>
        <div><strong>Atendimento</strong><span>Segunda a sexta, 9h às 18h</span></div>
        <div><strong>E-mail</strong><span>suporte@eventhub.com.br</span></div>
      </aside>
    </div>
  `;

  const form = container.querySelector('#contact-form');
  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const button = form.querySelector('button');
    const payload = Object.fromEntries(new FormData(form));
    setButtonLoading(button, true, 'Enviando...');
    try {
      const { data } = await api.post('/contact', payload);
      showToast(data.message);
      form.reset();
      if (user) {
        form.elements.name.value = user.name;
        form.elements.email.value = user.email;
      }
    } catch (error) {
      showToast(getErrorMessage(error, 'Não foi possível enviar a mensagem.'), 'error');
    } finally {
      setButtonLoading(button, false);
    }
  });
  return container;
}
