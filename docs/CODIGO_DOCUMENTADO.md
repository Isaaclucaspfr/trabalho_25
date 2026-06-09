# Guia do codigo do EventHub

Este documento explica a responsabilidade de cada parte do projeto, como os
dados percorrem o sistema e onde alterar cada comportamento.

## 1. Visao geral

O EventHub e dividido em tres partes:

- `frontend`: aplicacao Vite em JavaScript que cria e atualiza elementos do DOM.
- `backend`: API REST em Express, organizada em rotas, controladores, servicos e repositorios.
- `PostgreSQL`: banco acessado pelo Prisma, cujo contrato esta em `backend/prisma/schema.prisma`.

O fluxo normal de uma requisicao e:

```text
Pagina -> cliente Axios -> rota Express -> intermediario -> controlador
       -> servico -> repositorio/Prisma -> PostgreSQL
```

As responsabilidades sao separadas assim:

- **Rotas** definem URL, metodo HTTP e intermediarios.
- **Controladores** extraem dados de `req` e montam a resposta HTTP.
- **Servicos** concentram regras de negocio.
- **Repositorios** encapsulam operacoes simples do Prisma.
- **Esquemas** validam e convertem a entrada antes do controlador.
- **Intermediarios** tratam autenticacao, autorizacao, upload, erros e validacao.

### Padrao de nomes

Os arquivos internos usam `kebab-case` e, no backend, o ultimo termo informa a
responsabilidade do modulo:

- `rotas-evento.js`: registra endpoints de eventos.
- `controlador-evento.js`: adapta requisicoes HTTP.
- `servico-evento.js`: executa regras de negocio.
- `repositorio-evento.js`: acessa dados de eventos.
- `esquemas-evento.js`: valida dados de entrada.
- `intermediario-autenticar-requisicao.js`: executa uma etapa intermediaria da requisicao.

No frontend, paginas comecam com `pagina-`, componentes descrevem o elemento
visual (`cartao-evento.js`, `cabecalho-site.js`) e arquivos de infraestrutura
descrevem sua funcao (`cliente-api.js`, `roteador-cliente.js`).

Arquivos exigidos ou reconhecidos automaticamente pelas ferramentas conservam
os nomes convencionais, como `package.json`, `Dockerfile`, `index.html`,
`vite.config.js` e `schema.prisma`.

## 2. Arquivos da raiz

| Arquivo | Responsabilidade |
| --- | --- |
| `package.json` | Executa frontend e backend juntos com `npm run dev` e instala as duas aplicacoes com `npm run install:all`. |
| `docker-compose.yml` | Sobe os servicos da aplicacao em containers e conecta suas variaveis e portas. |
| `.gitignore` | Impede que dependencias, ambientes e arquivos gerados sejam versionados. |
| `README.md` | Guia rapido de instalacao, URLs, endpoints e credenciais de demonstracao. |

## 3. Inicializacao do backend

### `backend/src/inicializador-servidor.js`

E o ponto de entrada do processo Node. Importa a aplicacao Express e abre a
porta definida em `env.port`.

### `backend/src/aplicacao-http.js`

Monta a aplicacao Express na seguinte ordem:

1. `helmet` adiciona cabecalhos de seguranca.
2. `cors` aceita as origens configuradas e deploys em `*.vercel.app`.
3. `express.json` converte JSON recebido em `req.body`.
4. `morgan` registra as requisicoes no terminal.
5. `rateLimit` limita cada cliente a 300 requisicoes por 15 minutos.
6. `/uploads` publica imagens gravadas no disco.
7. `/api/docs` publica a interface Swagger.
8. `/api` recebe todas as rotas da aplicacao.
9. `/health` informa se o processo esta respondendo.
10. `errorMiddleware` transforma erros em respostas JSON.

### Configuracao

| Arquivo | Responsabilidade |
| --- | --- |
| `backend/src/config/configuracao-ambiente.js` | Le o `.env`, aplica valores padrao e exporta todas as configuracoes externas em um unico objeto. |
| `backend/src/config/cliente-banco-dados.js` | Cria e compartilha uma unica instancia de `PrismaClient`. |
| `backend/src/docs/especificacao-openapi.js` | Define titulo, versao, servidor e arquivos usados para gerar a especificacao OpenAPI. |

## 4. Rotas da API

`backend/src/routes/roteador-api.js` agrega os roteadores e adiciona seus prefixos.

| Arquivo | Endpoints e finalidade |
| --- | --- |
| `rotas-autenticacao.js` | Cadastro, login, renovacao de token e recuperacao de senha. |
| `rotas-usuario.js` | Perfil, avatar e favoritos. Todas as rotas exigem login. |
| `rotas-evento.js` | Listagem e detalhe publicos; criacao, edicao e exclusao restritas a administradores. |
| `rotas-artista.js` | CRUD de artistas e ranking de artistas em alta. Escritas exigem administrador. |
| `rotas-local.js` | CRUD de locais; escritas exigem administrador. |
| `rotas-ingresso.js` | Reserva, checkout, pagamento, cancelamento e ingressos do usuario autenticado. |
| `rotas-pagamento.js` | Processamento legado de pagamento e webhook do gateway. |
| `rotas-classificacao.js` | Ranking publico de popularidade dos eventos. |
| `rotas-painel.js` | Metricas administrativas protegidas por perfil `ADMIN`. |
| `rotas-album.js` | Lista os albuns com mais streams. |
| `rotas-contato.js` | Recebe mensagens do formulario de contato. |
| `rotas-suporte.js` | Alias de suporte para o mesmo fluxo de mensagens de contato. |
| `rotas-plataforma.js` | Metricas publicas usadas pela pagina institucional. |

Nos arquivos de rota, a ordem dos argumentos tambem documenta o fluxo. Uma
escrita administrativa passa por autenticacao, verificacao do papel,
upload/validacao e somente depois chega ao controller.

## 5. Controllers

Os arquivos em `backend/src/controllers` sao adaptadores HTTP pequenos:

| Controller | O que extrai e para onde envia |
| --- | --- |
| `controlador-autenticacao.js` | Envia credenciais e refresh token para `authService`. |
| `controlador-usuario.js` | Usa `req.user.sub` como ID do usuario autenticado; tambem monta a URL do avatar enviado. |
| `controlador-evento.js` | Envia filtros, parametros e dados de evento ao `eventService`; converte upload em `/uploads/arquivo`. |
| `controlador-artista.js` | Encaminha CRUD, imagem e consulta de tendencias ao `artistService`. |
| `controlador-local.js` | Encaminha CRUD de locais ao `locationService`. |
| `controlador-ingresso.js` | Associa todas as operacoes de ingresso ao usuario do token. |
| `controlador-pagamento.js` | Encaminha checkout e webhook ao `paymentService`. |
| `controlador-painel.js` | Retorna as metricas administrativas. |
| `controlador-album.js` | Retorna os albuns em alta. |
| `controlador-contato.js` | Cria mensagem e, quando houver token, associa o usuario. |
| `controlador-plataforma.js` | Retorna estatisticas publicas da plataforma. |

Controllers nao devem conter regras de negocio. Eles traduzem HTTP para
chamadas JavaScript e escolhem o status da resposta, como `201`.

## 6. Services e regras de negocio

### `servico-autenticacao.js`

- `register`: impede email duplicado, cria hash bcrypt e nunca devolve a senha.
- `login`: compara a senha, cria access/refresh tokens e salva o refresh token atual.
- `refresh`: verifica assinatura e confere se o token ainda e o salvo no usuario.
- `forgotPassword`: gera token aleatorio com validade de uma hora; o envio ainda e simulado.

### `servico-evento.js`

- `list`: monta filtros opcionais, paginacao e ordenacao; busca registros e total em paralelo.
- `findById`: busca o detalhe e registra uma visualizacao quando o evento existe.
- `create`: converte a data e cria os vinculos de artistas.
- `update`: substitui todos os artistas somente quando `artistIds` foi informado.
- `delete`: aplica soft delete por meio de `deletedAt`.
- `ranking`: calcula o score com vendas, favoritos, views e taxa de engajamento.

Formula atual:

```text
score = vendas * 0.5
      + favoritos * 0.3
      + views * 0.1
      + engajamento * 100 * 0.1
```

### `servico-ingresso.js`

- `reserve`: dentro de uma transacao, soma lugares ocupados e impede overbooking.
- `checkout`: delega a compra completa ao `paymentService`.
- `pay`: confirma manualmente um ingresso reservado e sincroniza o pagamento associado.
- `cancel`: cancela somente um ingresso pertencente ao usuario.
- `my`: lista os ingressos do usuario do mais novo para o mais antigo.

### `servico-pagamento.js`

`processCheckout` e dividido em duas transacoes porque a chamada ao gateway e
externa:

1. Valida evento e capacidade.
2. Cria pagamento e ingresso como `PENDING`.
3. Chama o gateway fora da transacao do banco.
4. Traduz o status do gateway para os enums internos.
5. Atualiza pagamento e ingresso juntos.

`handleWebhook` valida `x-webhook-secret`, localiza o pagamento pelo ID externo
e sincroniza todos os ingressos relacionados.

### Outros services

| Arquivo | Regras |
| --- | --- |
| `servico-artista.js` | CRUD e top 10 de artistas por vendas, favoritos e views; compara vendas dos ultimos 30 dias com os 30 anteriores. |
| `servico-album.js` | Retorna ate 12 albuns ordenados por streams e formata numeros como `K`, `M` e `B`. |
| `servico-painel.js` | Calcula usuarios, eventos, vendas, receita, top eventos e distribuicao por categoria. |
| `servico-contato.js` | Persiste a mensagem e dispara notificacao interna e resposta automatica sem bloquear uma pela outra. |
| `servico-notificacao.js` | Simula notificacoes por email e serve como ponto futuro de integracao com um provedor real. |
| `servico-gateway-pagamento.js` | Simula um gateway, mascara cartao e permite forcar pendencia com final `1111` ou falha com final `0000`. |
| `servico-plataforma.js` | Calcula ingressos vendidos, cidades ativas, dias de operacao e uma taxa baseada em cancelamentos. |
| `servico-local.js` | Encaminha CRUD de locais ao repository. |
| `servico-usuario.js` | Atualiza perfil, alterna favorito e lista eventos favoritos. |

## 7. Repositories

Os arquivos em `backend/src/repositories` sao a fronteira simples com o Prisma:

| Arquivo | Operacoes |
| --- | --- |
| `repositorio-usuario.js` | Busca por email/ID ignorando excluidos, cria e atualiza usuario. |
| `repositorio-evento.js` | Busca detalhe com local, artistas e contadores; cria, atualiza e faz soft delete. |
| `repositorio-artista.js` | Lista, busca, cria, atualiza e faz soft delete de artista. |
| `repositorio-local.js` | Lista, busca, cria, atualiza e faz soft delete de local. |
| `repositorio-ingresso.js` | Cria, busca, atualiza e lista ingressos com seus eventos. |

Consultas complexas ou que representam uma regra continuam nos services.

## 8. Middlewares, validadores e utilitarios

### Middlewares

| Arquivo | Comportamento |
| --- | --- |
| `intermediario-autenticar-requisicao.js` | Exige `Authorization: Bearer`, verifica o JWT e grava o payload em `req.user`. |
| `intermediario-autorizar-perfil.js` | Recebe papeis permitidos e responde `403` quando o usuario nao pertence a eles. |
| `intermediario-validar-requisicao.js` | Executa um schema Zod, substitui a entrada pelos dados tratados e retorna `422` em caso de erro. |
| `intermediario-enviar-arquivo.js` | Configura Multer para salvar arquivos em `uploads/` com nome unico. |
| `intermediario-tratar-erros.js` | Converte qualquer erro encaminhado pelo Express em `{ message, status }`. |

### Validators

Cada arquivo em `backend/src/validators` descreve o contrato aceito pela API:

- `esquemas-autenticacao.js`: nome, email, senha e tokens.
- `esquemas-usuario.js`: campos editaveis do perfil.
- `esquemas-evento.js`: dados, capacidade, preco, status, local e artistas do evento.
- `esquemas-artista.js`: dados publicos e links do artista.
- `esquemas-local.js`: endereco, capacidade e coordenadas.
- `esquemas-ingresso.js`: evento, quantidade e ID do ingresso.
- `esquemas-pagamento.js`: checkout por token de pagamento ou cartao, alem do webhook.
- `esquemas-contato.js`: identificacao, assunto e texto da mensagem.

### Utils

| Arquivo | Comportamento |
| --- | --- |
| `erro-aplicacao.js` | Erro de negocio com `statusCode` HTTP. |
| `manipulador-rota-assincrona.js` | Captura rejeicoes de controllers async e as envia ao middleware de erro. |
| `gerenciador-token.js` | Assina e verifica access e refresh tokens com segredos e prazos diferentes. |

## 9. Banco de dados

### Enums

- `UserRole`: usuario comum ou administrador.
- `EventStatus`: rascunho, publicado, esgotado ou cancelado.
- `TicketStatus`: pendente, reservado, pago ou cancelado.
- `PaymentStatus`: pendente, pago, falhou ou cancelado.
- `SupportMessageStatus`: nova, em atendimento ou resolvida.

### Models

| Model | Finalidade e relacoes principais |
| --- | --- |
| `User` | Conta, credenciais, tokens, papel, ingressos, pagamentos, favoritos e mensagens. |
| `Location` | Local fisico com endereco/capacidade e seus eventos. |
| `Event` | Evento, data, preco, capacidade, local, artistas, ingressos e indicadores sociais. |
| `Artist` | Artista, biografia, genero, links, eventos e albuns. |
| `EventArtist` | Tabela de juncao muitos-para-muitos entre evento e artista. |
| `Ticket` | Quantidade comprada, valor, codigo, status, usuario, evento e pagamento opcional. |
| `Favorite` | Chave composta que impede o mesmo usuario de favoritar duas vezes o mesmo evento. |
| `EventView` | Registro de visualizacao, opcionalmente associado a um usuario. |
| `Payment` | Estado do gateway, valores, payloads de auditoria, usuario, evento e ingressos. |
| `Album` | Album de artista com contador de streams. |
| `SupportMessage` | Solicitacao de contato e seu estado de atendimento. |

`backend/prisma/popular-banco-dados.js` limpa/preenche dados de demonstracao, incluindo contas,
locais, artistas, eventos, relacionamentos, ingressos, favoritos, views e albuns.

## 10. Inicializacao do frontend

### `frontend/src/inicializador-aplicacao.js`

E o composition root da interface:

1. Sincroniza o usuario salvo chamando `refreshMe`.
2. Cria o cabecalho.
3. Cria o elemento `#app-content`.
4. Registra o mapa de URLs para componentes.
5. Cria uma unica instancia de `Router`.
6. Expoe `window.appRouter` para paginas que precisam navegar.

### `frontend/src/roteador-cliente.js`

Implementa uma SPA sem framework:

- intercepta links com `data-link`;
- usa `history.pushState` sem recarregar a pagina;
- reage ao botao voltar/avancar com `popstate`;
- aceita caminhos literais e expressoes regulares;
- chama o componente e renderiza `HTMLElement` ou string;
- usa `/` como fallback para caminho desconhecido.

## 11. Infraestrutura do frontend

### `frontend/src/api/cliente-api.js`

Cria o Axios com a URL da API. O interceptor de requisicao adiciona o access
token. O interceptor de resposta trata `401`:

1. A primeira requisicao inicia a renovacao.
2. Requisicoes simultaneas entram em uma fila.
3. O novo token libera toda a fila.
4. Cada requisicao original e repetida uma unica vez.
5. Uma falha no refresh limpa a sessao local.

### `frontend/src/context/sessao-autenticacao.js`

- `getUser`/`getToken`: leem a sessao local.
- `isAdmin`: consulta o papel do usuario.
- `persist`: grava tokens e usuario depois da autenticacao.
- `loginApi`/`registerApi`: integram os formularios com a API.
- `refreshMe`: valida a sessao buscando `/users/me`.
- `logout`: remove todos os dados locais.
- `requireAuth`/`requireAdmin`: protegem paginas antes de renderiza-las.

### Utilitarios

| Arquivo | Funcoes |
| --- | --- |
| `utils/auxiliares-interface.js` | Formata moeda/data, resolve URLs de imagens, exibe toasts e controla estado de botoes. |
| `utils/mensagem-erro-api.js` | Extrai a mensagem padronizada da resposta Axios ou usa um fallback. |

## 12. Componentes do frontend

### `components/cabecalho-site.js`

Cria o cabecalho conforme a sessao. Usuarios logados recebem links privados;
administradores tambem recebem dashboard e gestao. Atualiza a classe `active`
quando o historico ou a navegacao interna muda.

### `components/cartao-evento.js`

Transforma um objeto de evento em um card reutilizavel. Resolve imagem, data,
local e preco, cria link de detalhe e delega a acao de favorito ao callback
recebido pela pagina.

## 13. Paginas do frontend

| Pagina | Comportamento |
| --- | --- |
| `pagina-inicial.js` | Busca destaques e ranking em paralelo, preenche metricas, cards e top 5. |
| `pagina-catalogo-eventos.js` | Mantem pagina/filtros em estado local, consulta eventos paginados e controla botoes anterior/proximo. |
| `pagina-detalhes-evento.js` | Extrai o ID da URL, busca evento e ingressos, renderiza artistas e permite favoritar, comprar, pagar ou cancelar. |
| `pagina-finalizar-compra.js` | Exige login, le quantidade da query string, calcula total e envia cartao ao checkout. |
| `pagina-favoritos.js` | Exige login, lista favoritos e remove cards da tela apos desfavoritar. |
| `pagina-ingressos.js` | Exige login, lista pedidos e usa delegacao de eventos para pagar/cancelar e recarregar a lista. |
| `pagina-acesso.js` | Alterna entre login e cadastro, envia credenciais e recarrega a aplicacao apos autenticar. |
| `pagina-perfil.js` | Exige login, atualiza dados em JSON e avatar em `multipart/form-data`. |
| `pagina-painel-administrativo.js` | Exige administrador e mostra metricas, top eventos e barras por categoria. |
| `pagina-gerenciar-eventos.js` | Exige administrador; carrega eventos, locais e artistas, reutiliza o formulario para criar/editar e faz soft delete. |
| `pagina-classificacao.js` | Exibe a posicao e os componentes do score de popularidade. |
| `pagina-em-alta.js` | Busca artistas e albuns em paralelo e mostra festivais relacionados. |
| `pagina-sobre.js` | Mostra conteudo institucional mesmo se as metricas publicas falharem. |
| `pagina-contato.js` | Preenche nome/email da sessao, envia mensagem e restaura esses campos apos limpar o formulario. |

## 14. Estilos, build e testes

| Arquivo/pasta | Responsabilidade |
| --- | --- |
| `frontend/src/styles/estilos-aplicacao.css` | Design system visual, layouts, componentes, estados e responsividade da aplicacao. |
| `frontend/index.html` | Documento HTML inicial que contem o elemento `#root`. |
| `frontend/vite.config.js` | Configuracao do servidor e build Vite. |
| `frontend/Dockerfile` | Imagem usada para executar o frontend em container. |
| `backend/Dockerfile` | Imagem usada para instalar Prisma e executar a API. |
| `backend/tests/integration` | Verifica rotas e respostas HTTP com Supertest. |
| `backend/tests/services` | Testa regras de artistas, contato e pagamentos com Vitest. |

## 15. Onde alterar cada funcionalidade

| Objetivo | Arquivos principais |
| --- | --- |
| Criar uma nova pagina | `frontend/src/pages`, `frontend/src/inicializador-aplicacao.js` e links do `cabecalho-site.js`. |
| Criar um endpoint | `routes`, `controller`, `service` e, se necessario, `repository`/`validator`. |
| Alterar regras de ingresso | `servico-ingresso.js` e `servico-pagamento.js`. |
| Alterar ranking | `eventService.ranking` e as paginas `RankingPage`/`HomePage`. |
| Alterar login ou tokens | `servico-autenticacao.js`, `gerenciador-token.js`, `intermediario-autenticar-requisicao.js`, `sessao-autenticacao.js` e `api/cliente-api.js`. |
| Alterar entidades | `schema.prisma`, migration, seed e camadas que consomem o campo. |
| Alterar permissoes | Arquivos de rota com `authMiddleware` e `roleMiddleware`. |
| Alterar visual | `frontend/src/styles/estilos-aplicacao.css` e o HTML gerado pelo componente/pagina. |
