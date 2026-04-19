# Senior-Capstone

Minimal full-stack capstone app with:

- `frontend` (React + Vite)
- `backend` (Node.js + Express)
- optional `pico` scripts for Raspberry Pi Pico 2 W testing

## Local quick start

Backend:

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

Frontend (new terminal):

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Optional fake telemetry (new terminal):

```bash
cd backend
npm run fake-readings
```

## Deployment (basic AWS)

See `docs/aws-basic-deploy.md` for the simplest resume-friendly path:

- frontend on S3 + CloudFront
- backend on Elastic Beanstalk
- optional RDS later
