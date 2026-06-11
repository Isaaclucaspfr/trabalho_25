# EventHub

Plataforma full stack para descoberta e gerenciamento de eventos, artistas,
locais, favoritos, ingressos, pagamentos e ranking de popularidade.

## Tecnologias

- Backend: Node.js, Express e JavaScript com ES Modules
- Banco de dados: PostgreSQL 16
- ORM e administração do banco: Prisma 6
- Frontend: JavaScript, HTML, CSS e Vite
- Autenticação: JWT com access token e refresh token
- Validação: Zod
- Uploads: Multer
- Gráficos: Chart.js
- Segurança: Helmet, CORS, rate limiting e bcrypt
- Documentação da API: Swagger UI
- Testes: Vitest e Supertest
- Infraestrutura local: Docker e Docker Compose

## Estrutura

```text
trabalho_25/
|-- backend/
|   |-- prisma/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- middlewares/
|   |   |-- repositories/
|   |   |-- routes/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- validators/
|   `-- tests/
|-- docs/
|-- frontend/
|   `-- src/
|       |-- api/
|       |-- components/
|       |-- context/
|       |-- pages/
|       |-- styles/
|       `-- utils/
`-- docker-compose.yml
```

Para uma explicação detalhada da arquitetura e dos fluxos internos, consulte
[`docs/CODIGO_DOCUMENTADO.md`](docs/CODIGO_DOCUMENTADO.md).

## Pré-requisitos

- Node.js 20 ou superior
- npm
- Docker Desktop, para a execução com containers

## Execução com Docker

Na raiz do projeto:

```bash
docker compose up --build
```

O backend executa `prisma db push` automaticamente ao iniciar.

Serviços disponíveis:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`
- Health check: `http://localhost:4000/health`
- PostgreSQL: `localhost:5432`

Para popular o banco executado pelo Docker:

```bash
docker compose exec backend npm run prisma:seed
```

Para encerrar os containers:

```bash
docker compose down
```

Use `docker compose down -v` somente quando também quiser apagar os dados do
PostgreSQL local.

## Execução local

Instale as dependências:

```bash
npm install
npm run install:all
```

Crie `backend/.env` com base em `backend/.env.example`. Quando o backend for
executado fora do Docker, use `localhost` no endereço do banco:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/eventhub
JWT_ACCESS_SECRET=troque_esta_chave
JWT_REFRESH_SECRET=troque_esta_chave
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d
FRONTEND_URL=http://localhost:5173
FRONTEND_URLS=
PAYMENT_GATEWAY_PROVIDER=mock
PAYMENT_WEBHOOK_SECRET=troque_esta_chave
SUPPORT_ALERT_EMAIL=suporte@eventhub.com.br
```

Com o PostgreSQL disponível, prepare o Prisma:

```bash
cd backend
npx prisma db push
npm run prisma:generate
npm run prisma:seed
cd ..
```

Inicie backend e frontend:

```bash
npm run dev
```

## Prisma Studio

Dentro de `backend`:

```bash
npx prisma studio --port 5555
```

Acesse `http://localhost:5555`.

Se a porta estiver ocupada, encerre a instância anterior ou escolha outra:

```bash
npx prisma studio --port 5556
```

O schema usa exclusão em cascata nas dependências de eventos. Portanto, excluir
fisicamente um evento pelo Prisma Studio também remove seus vínculos com
artistas, ingressos, pagamentos, favoritos e visualizações.

## Scripts

Na raiz:

```bash
npm run dev
npm run install:all
```

No diretório `backend`:

```bash
npm run dev
npm start
npm test
npm run test:watch
npm run prisma:generate
npm run prisma:migrate
npm run prisma:deploy
npm run prisma:seed
```

No diretório `frontend`:

```bash
npm run dev
npm run build
npm run preview
```

## Endpoints

Todos os endpoints abaixo usam o prefixo `/api`.

### Autenticação

- `POST /auth/register`
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/forgot-password`

### Usuários autenticados

- `GET /users/me`
- `PUT /users/me`
- `POST /users/me/avatar`
- `GET /users/favorites`
- `POST /users/favorites/:eventId`

### Eventos

- `GET /events`
- `GET /events/:id`
- `POST /events` - administrador
- `PUT /events/:id` - administrador
- `DELETE /events/:id` - administrador

### Artistas e álbuns

- `GET /artists`
- `GET /artists/trending`
- `GET /artists/:id`
- `POST /artists` - administrador
- `PUT /artists/:id` - administrador
- `DELETE /artists/:id` - administrador
- `GET /albums/trending`

### Locais

- `GET /locations`
- `GET /locations/:id`
- `POST /locations` - administrador
- `PUT /locations/:id` - administrador
- `DELETE /locations/:id` - administrador

### Ingressos e pagamentos

- `POST /tickets/reserve`
- `POST /tickets/checkout`
- `POST /tickets/pay`
- `POST /tickets/cancel`
- `GET /tickets/my`
- `POST /payments/process`
- `POST /payments/webhook`

### Plataforma

- `GET /ranking/eventos`
- `GET /dashboard/metrics` - administrador
- `GET /platform/stats`
- `POST /contact`
- `POST /support/messages`

A especificação completa e os corpos das requisições estão disponíveis no
Swagger: `http://localhost:4000/api/docs`.

## Credenciais do seed

- Administrador: `admin@eventhub.com` / `123456`
- Usuário: `user@eventhub.com` / `123456`

Essas credenciais são apenas para desenvolvimento e demonstração.

## Testes

No diretório `backend`:

```bash
npm test
```

Os testes cobrem serviços e rotas HTTP com Vitest e Supertest.

## Funcionalidades

- Cadastro, autenticação e atualização de perfil
- Administração de eventos, artistas e locais
- Upload de imagens e avatares
- Favoritos e registro de visualizações
- Reserva, checkout e cancelamento de ingressos
- Processamento de pagamentos com gateway simulado
- Controle de capacidade para evitar overbooking
- Ranking por vendas, favoritos, visualizações e engajamento
- Dashboard administrativo
- Formulários de contato e suporte
- Exclusão lógica das principais entidades pela API

## Segurança

Não publique arquivos `.env`, tokens, senhas ou URLs de banco contendo
credenciais. Em produção, use segredos fortes e diferentes dos valores de
desenvolvimento.

## Uso da IA

Foi utilizado o antigravity para ajudar na estilização do frontend e ele 
acabou nos dando a ideia de usar o JavaScript puro para manipular o DOM e trocar o conteúdo da tela de acordo com a URL, evitando multiplos HTML e 
deixando mais rapido a navegação.

Também foi usado o CODEX para documentação e ajuda na configuração e conexão do banco de dados com o backend.

