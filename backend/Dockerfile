FROM node:20-bookworm-slim
WORKDIR /app

RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm ci
COPY . .

ARG DATABASE_URL="postgresql://postgres:postgres@localhost:5432/eventhub?schema=public"
ENV DATABASE_URL=${DATABASE_URL}
RUN npx prisma generate

EXPOSE 4000
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start"]
