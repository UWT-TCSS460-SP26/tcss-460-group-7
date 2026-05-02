# TCSS 460 — Group Project Backend

Express + TypeScript API for the TCSS 460 group project.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Start development server (auto-reloads on changes)
npm run dev

# Run service test for Heartbeat
npm run health
```

# Audience Name

Audience name: group-7-api

The server starts at [http://localhost:3000](http://localhost:3000).

**API Audience:** `group-7-api`

API documentation is at [http://localhost:3000/api-docs](http://localhost:3000/api-docs).

## Scripts

| Command                | Description                         |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Start dev server with auto-reload   |
| `npm run build`        | Compile TypeScript to `dist/`       |
| `npm start`            | Run compiled output                 |
| `npm test`             | Run tests                           |
| `npm run prisma:db`    | Open Prisma Studio to view database |
| `npm run status`       | Check service status                |
| `npm run lint`         | Run ESLint                          |
| `npm run lint:fix`     | Run ESLint and auto fix issue       |
| `npm run format`       | Format code with Prettier           |
| `npm run format:check` | Check formatting                    |

## Deployed URL

Live URL at [https://tcss-460-group-7.onrender.com](https://tcss-460-group-7.onrender.com)

Live URL for API doc [https://tcss-460-group-7.onrender.com/api-docs/]
