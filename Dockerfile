FROM node:22-bookworm-slim

WORKDIR /app

ENV DATABASE_URL=file:/app/data/dev.db

RUN apt-get update -y && apt-get install -y openssl \
  && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci
RUN npx prisma generate --schema prisma/schema.prisma

COPY tsconfig.json ./
COPY openapi.yaml ./
COPY src ./src

RUN npm run build

EXPOSE 3000

CMD ["sh", "-c", "npx prisma db push --schema prisma/schema.prisma && npx prisma db seed && npm start"]
