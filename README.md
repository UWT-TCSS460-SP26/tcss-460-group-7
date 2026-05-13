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

## Audience Name

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

## For Downstream / Partner Developers

### Getting a Token

Use the [Token Playground](https://tcss460-token-playground.onrender.com/) to generate a JWT for testing.

When prompted for an audience, enter exactly: **`group-7-api`**

Include the token in every authenticated request:

```
Authorization: Bearer <your-token>
```

### Endpoints

Full interactive docs (request/response schemas, try-it-out): [https://tcss-460-group-7.onrender.com/api-docs](https://tcss-460-group-7.onrender.com/api-docs)

### CORS

The API allowlist is controlled by the `CORS_ALLOWED_ORIGINS` environment variable (comma-separated origins).

Currently allowed:

- `http://localhost:3000`
- `http://localhost:5173`

To get your origin added for production, open a bug report (see below) or contact the team directly. Adding a new origin is a one-line change to the Render env var — no redeploy required.

### Filing Bug Reports

Use the Bug Tracker at [https://tcss-460-group-7.onrender.com/issrep](https://tcss-460-group-7.onrender.com/issrep) _(launching Sprint 5 — available by Monday)_.

### Known Limits and Quirks

- **TMDB metadata is fetched on demand** — Endpoints that return TMDB-enriched data (`/v1/media`, `/v1/users/me/ratings`, `/v1/users/me/reviews`, `/v1/community/top-rated`) make live calls to TMDB per request. There is no cache. If TMDB is slow or down, `metadata` fields will return `null` rather than failing the whole request.
- **`media_type` is required** on `POST /v1/ratings/:title_id` and `POST /v1/reviews`. Must be `"movie"` or `"tv"`. Omitting it returns a `400`.
- **One review per user per title** — A user cannot post two reviews for the same `title_id`. A second attempt returns `409`.
- **Authentication** — Most write endpoints and all `/v1/users/me/*` routes require a valid bearer token issued by `https://tcss-460-iam.onrender.com`. Public read endpoints (`/v1/community/top-rated`, `/v1/media/:type/:id`, search routes) require no token.
