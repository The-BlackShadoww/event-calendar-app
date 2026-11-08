# Event Calendar

Schedule an event and it opens and closes itself on time. Each event moves through `PENDING → ACTIVE → COMPLETED` (or a cancelled state), driven by delayed BullMQ jobs instead of a polling cron.

Built by [Ashikur Rahman](https://ashikurrahman.vercel.app). Run it locally with the steps below.

## How it works

```mermaid
flowchart LR
  UI[React + Vite] -->|REST| API[NestJS API]
  API -->|Drizzle| PG[(PostgreSQL)]
  API -->|delayed jobs| Q[(Redis / BullMQ)]
  Q --> W[Events worker]
  W -->|set ACTIVE / COMPLETED| PG
```

- **One delayed job per transition.** Creating an event queues an `activate-event` job for its start time and a `complete-event` job for its end time.
- **Deterministic job IDs** (`event-<id>-activate`, `event-<id>-complete`), so the same transition is never queued twice.
- **Retries with exponential backoff** on completion jobs; failed jobs are kept for inspection.
- **Status rules in the database**: a `CHECK` constraint allows only the five valid statuses, and a `(status, scheduled_at)` index keeps the calendar queries fast.

## Project layout

Event Calendar is a full-stack local development project with:

- `backend`: NestJS API, PostgreSQL, Redis, BullMQ, Drizzle ORM
- `frontend`: React, TypeScript, Vite, Tailwind CSS
- `docker-compose.yml`: local PostgreSQL and Redis services

## Prerequisites

Install these before running the app locally:

- Node.js and npm
- Docker Desktop

## Local Services

The backend needs PostgreSQL and Redis. Start both from the project root:

```bash
docker compose up -d
```

This starts:

- PostgreSQL on `localhost:15432`
- Redis on `localhost:16379`

To stop them later:

```bash
docker compose down
```

## Backend Setup

Open a terminal from the project root and install backend dependencies:

```bash
cd backend
npm install
```

Create a local environment file:

```bash
cp .env.example .env
```

Set `backend/.env` to:

```env
DATABASE_URL=postgres://postgres:postgres@localhost:15432/event_calendar
REDIS_HOST=localhost
REDIS_PORT=16379
PORT=3000
```

Run database migrations:

```bash
npm run db:migrate
```

Start the backend in development mode:

```bash
npm run start:dev
```

The API runs at:

```text
http://localhost:3000
```

## Frontend Setup

Open a second terminal from the project root and install frontend dependencies:

```bash
cd frontend
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend runs at:

```text
http://localhost:5173
```

During development, frontend API calls use `/api`. Vite proxies those requests to the backend at `http://localhost:3000` and removes the `/api` prefix before forwarding.

## Recommended Startup Order

Use three terminals:

1. Root terminal:

   ```bash
   docker compose up -d
   ```

2. Backend terminal:

   ```bash
   cd backend
   npm run db:migrate
   npm run start:dev
   ```

3. Frontend terminal:

   ```bash
   cd frontend
   npm run dev
   ```

Then open:

```text
http://localhost:5173
```

## Useful Commands

Backend:

```bash
cd backend
npm run build
npm run test
npm run lint
npm run db:studio
```

Frontend:

```bash
cd frontend
npm run build
npm run lint
npm run preview
```

## Troubleshooting

If the backend cannot connect to the database, confirm Docker is running and PostgreSQL is listening on `localhost:15432`.

If the backend cannot connect to Redis, confirm Redis is listening on `localhost:16379` and that `REDIS_PORT=16379` is set in `backend/.env`.

If the frontend cannot reach the API, make sure the backend is running on port `3000`. The Vite proxy in `frontend/vite.config.ts` forwards `/api` requests to `http://localhost:3000`.
