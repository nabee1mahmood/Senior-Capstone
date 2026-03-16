# Backend API (Node.js + Express)

## Setup

```bash
cd backend
npm install
```

## Run

```bash
npm run dev
```

API base URL: **http://localhost:3001**

- `GET /api/health` – check if API is up
- `GET /api/sensors` – list sensors (mock data)
- `POST /api/login` – login (mock; send `{ "email", "password" }`)

## Optional: use a real `.env`

Copy `.env.example` to `.env` and set `PORT` or DB vars when you add Postgres.
