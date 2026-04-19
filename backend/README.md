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

API base URL: **http://localhost:8080**

- `GET /api/health` – check if API is up
- `GET /api/sensors` – list sensors (mock data)
- `POST /api/login` – login (send `{ "email", "password" }`)
- `POST /api/readings` – push synthetic reading (send `{ "device_uid", "value", "sensor_type", "unit" }`)

## Optional: use a real `.env`

Copy `.env.example` to `.env` and set `PORT` or DB vars when you add Postgres.

## Generate fake telemetry data

With the backend running, send simulated readings every 10 seconds:

```bash
npm run fake-readings
```

Optional environment variables:

- `API_BASE_URL` (default `http://localhost:8080`)
- `FAKE_INTERVAL_MS` (default `10000`)
