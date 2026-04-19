# Basic AWS Deployment Guide (Simple Version)

This guide keeps the project easy to deploy and demo:

- Frontend: S3 + CloudFront (global website)
- Backend API: Elastic Beanstalk (Node.js)
- Data source: fake sensor data (`npm run fake-readings`)

## 1) Deploy backend to Elastic Beanstalk

1. Open AWS Console -> Elastic Beanstalk -> Create application.
2. Platform: **Node.js**.
3. Upload backend source bundle:
   - zip the contents of `backend` (including `package.json`, `server.js`, `db.js`, etc.)
4. Set environment variable in Beanstalk:
   - `PORT=8080`
5. Deploy and copy the environment URL, for example:
   - `http://my-capstone-api.us-east-1.elasticbeanstalk.com`

## 2) Point frontend to the backend URL

In `frontend/.env`, set:

```bash
VITE_API_URL=http://my-capstone-api.us-east-1.elasticbeanstalk.com
```

Build frontend:

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist`.

## 3) Host frontend on S3

1. AWS Console -> S3 -> Create bucket (globally unique name).
2. Disable block public access for static hosting.
3. Enable Static website hosting.
4. Upload all files from `frontend/dist`.
5. Add bucket policy for public read of objects.
6. Test with the S3 website endpoint.

## 4) Make frontend global with CloudFront

1. AWS Console -> CloudFront -> Create distribution.
2. Origin domain: S3 bucket website endpoint.
3. Default root object: `index.html`.
4. Create distribution and use CloudFront URL for global access.

If React routes fail on refresh, configure custom error response:

- HTTP 404 -> return `/index.html` with 200

## 5) Demo fake telemetry data

Keep backend running, then post simulated readings from local machine:

```bash
cd backend
API_BASE_URL=http://my-capstone-api.us-east-1.elasticbeanstalk.com npm run fake-readings
```

This proves end-to-end cloud ingestion even without live sensor hardware.

## Optional upgrades later

- Add RDS PostgreSQL when you want persistent hosted data.
- Add Route 53 + ACM certificate for custom HTTPS domain.
- Add GitHub Actions CI/CD for one-click deploys.
