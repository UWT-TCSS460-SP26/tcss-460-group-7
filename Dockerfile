FROM node:22-bookworm-slim

WORKDIR /app
ENV DATABASE_URL=postgresql://postgres:mysecretpassword@db:5432/tcss460_group_project

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

CMD ["sh", "-c", "until npx prisma migrate deploy --schema prisma/schema.prisma; do echo 'Waiting for database...'; sleep 2; done && npx prisma db seed --schema prisma/schema.prisma && npm start"]
