# EventHub

Plataforma fullstack para gerenciamento de eventos, favoritos e reserva/compra de ingressos.

## Stack
- Backend: Node.js + Express
- Banco: PostgreSQL + Prisma
- Frontend: React + Vite
- Auth: JWT (access + refresh)
- Uploads: Multer
- Validação: Zod
- Segurança: Helmet, CORS, Rate Limit, bcrypt
- Docs: Swagger
- Containers: Docker + Docker Compose

## Estrutura
- `backend/src/controllers`
- `backend/src/services`
- `backend/src/repositories`
- `backend/src/middlewares`
- `backend/src/routes`
- `backend/src/validators`
- `backend/src/config`
- `backend/src/utils`
- `backend/prisma`
- `frontend/src/pages`
- `frontend/src/components`
- `frontend/src/context`

## Como rodar com Docker
1. Na raiz do projeto:
```bash
docker compose up --build
```
2. URLs:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:4000`
- Swagger: `http://localhost:4000/api/docs`

## Variáveis de ambiente backend
Copie `backend/.env.example` para `backend/.env`.

Principais variáveis:
- `PORT`
- `DATABASE_URL`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `JWT_ACCESS_EXPIRES`
- `JWT_REFRESH_EXPIRES`
- `FRONTEND_URL`

## Migrations e seed
No backend:
```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

## Endpoints principais
### Auth
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`

### Usuarios
- `GET /api/users/me`
- `PUT /api/users/me`
- `POST /api/users/me/avatar`
- `GET /api/users/favorites`
- `POST /api/users/favorites/:eventId`

### Eventos
- `GET /api/events`
- `GET /api/events/:id`
- `POST /api/events`
- `PUT /api/events/:id`
- `DELETE /api/events/:id`

### Artistas
- `GET /api/artists`
- `GET /api/artists/:id`
- `POST /api/artists`
- `PUT /api/artists/:id`
- `DELETE /api/artists/:id`

### Locais
- `GET /api/locations`
- `GET /api/locations/:id`
- `POST /api/locations`
- `PUT /api/locations/:id`
- `DELETE /api/locations/:id`

### Ingressos
- `POST /api/tickets/reserve`
- `POST /api/tickets/pay`
- `POST /api/tickets/cancel`
- `GET /api/tickets/my`

### Ranking
- `GET /api/ranking/eventos`

### Dashboard admin
- `GET /api/dashboard/metrics`

## Credenciais seed
- Admin: `admin@eventhub.com` / `123456`
- Usuario: `user@eventhub.com` / `123456`

## Regras implementadas
- Soft delete em entidades principais
- Controle de overbooking em reserva
- Ranking por score de popularidade (vendas + favoritos + views + engajamento)
- Dashboard com totais e categorias
- Arquitetura em camadas (controller/service/repository)

## Extras planejados
- Redis cache
- BullMQ
- WebSocket
- Testes automatizados
- CI/CD
- S3
- Observabilidade
