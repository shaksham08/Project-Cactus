# AWS Deployment Guide

This repo is easiest to deploy with:

- Frontend: AWS Amplify Hosting
- Backend: AWS App Runner
- Database: MongoDB Atlas or any managed MongoDB URI you already use

Config files already added in repo root:

- `amplify.yml` for frontend builds
- `apprunner.yaml` for backend builds

This is the simplest production path for the current codebase.

## 1. What gets deployed

- `cactus-frontend` builds to static files with Vite
- `cactus-backend` runs as a Node.js web service
- The backend needs these env vars:
  - `PORT`
  - `MONGODB_URI`
  - `JWT_SECRET`
  - `CLIENT_URL`
- The frontend needs this env var at build time:
  - `VITE_API_BASE_URL`

## 2. Deploy the backend with AWS App Runner

### 2.1 Prepare the backend

App Runner can deploy directly from GitHub.

This repo already includes `apprunner.yaml`, so choose configuration from source code when prompted.

Build settings for the backend service:

- Root directory: `cactus-backend`
- Build command: `npm install`
- Start command: `npm start`
- Port: `5000`

### 2.2 Set backend environment variables

In App Runner, add:

- `PORT=5000`
- `MONGODB_URI=<your-mongodb-connection-string>`
- `JWT_SECRET=<long-random-secret>`
- `CLIENT_URL=https://<your-frontend-domain>`

Example:

```text
PORT=5000
MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<db>?retryWrites=true&w=majority
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=https://main.d123example.amplifyapp.com
```

### 2.3 Health check

Use:

```text
/api/health
```

After deployment, verify:

```text
https://<your-backend-domain>/api/health
```

Expected result: JSON success response.

## 3. Deploy the frontend with AWS Amplify

### 3.1 Connect the frontend repo

In AWS Amplify:

- Choose Host web app
- Connect your GitHub repo
- Select the branch you pushed
- Set the app root to `cactus-frontend`

### 3.2 Amplify build settings

This repo already includes `amplify.yml` in the root. Amplify will detect and use it automatically.

Reference build config:

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: dist
    files:
      - "**/*"
  cache:
    paths:
      - node_modules/**/*
```

### 3.3 Frontend environment variable

In Amplify, add:

```text
VITE_API_BASE_URL=https://<your-backend-domain>/api
```

Example:

```text
VITE_API_BASE_URL=https://abc123.us-east-1.awsapprunner.com/api
```

## 4. CORS wiring

Your backend uses `CLIENT_URL` for CORS.

That means after the frontend is deployed, the backend must allow the exact frontend domain, for example:

```text
CLIENT_URL=https://main.d123example.amplifyapp.com
```

If you later add a custom frontend domain, update `CLIENT_URL` in App Runner to the new domain and redeploy.

## 5. Deployment order

Use this order:

1. Deploy backend first
2. Copy the backend URL
3. Set `VITE_API_BASE_URL` in Amplify
4. Deploy frontend
5. Copy the frontend URL
6. Set `CLIENT_URL` in App Runner
7. Redeploy backend once

This avoids CORS mismatches.

## 6. Custom domains

### Frontend

Attach a custom domain in Amplify if you want one.

### Backend

You can keep the default App Runner URL or put CloudFront/API Gateway/custom DNS in front later.

## 7. If you want S3 + CloudFront instead of Amplify

You can also deploy the frontend manually:

```bash
cd cactus-frontend
npm install
npm run build
```

Then upload `dist/` to an S3 bucket configured for static hosting and place CloudFront in front of it.

Amplify is simpler for this repo because it rebuilds automatically from GitHub.

## 8. If you want everything strictly on AWS

Your app currently expects a MongoDB connection string.

Simplest option:

- keep MongoDB on Atlas

AWS-only option:

- migrate to Amazon DocumentDB

DocumentDB is possible, but it usually needs extra connection configuration and is not the fastest path for this project.

## 9. Quick checklist

Backend:

- Root: `cactus-backend`
- Build: `npm install`
- Start: `npm start`
- Port: `5000`
- Health check: `/api/health`
- Env: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

Frontend:

- Root: `cactus-frontend`
- Build: `npm ci && npm run build`
- Output: `dist`
- Env: `VITE_API_BASE_URL`

## 10. Common failure cases

### Frontend says Network Error

Usually one of these:

- `VITE_API_BASE_URL` still points to localhost
- backend `CLIENT_URL` does not match deployed frontend domain
- backend health endpoint is down

### Auth works locally but not in cloud

Check:

- `JWT_SECRET` is set
- `MONGODB_URI` is valid from App Runner
- frontend is calling the correct `/api` base URL

### CORS failure in browser

Check:

- `CLIENT_URL` exactly matches frontend domain
- protocol matches `https`
- no trailing slash mismatch

## 11. Minimum values to keep ready before deployment

- MongoDB URI
- one strong JWT secret
- chosen AWS region
- GitHub repo already pushed

## 12. Suggested region

Use the same AWS region for Amplify and App Runner when possible.

A good default is:

- `us-east-1`

## 13. Final test after deployment

1. Open frontend
2. Register a user
3. Create a todo
4. Create a rich note
5. Create and publish a test
6. Log in with another user
7. Verify the published test is visible

If you want, the next useful step is either:

1. I create an `apprunner.yaml` for the backend and an `amplify.yml` for the frontend
2. I walk you through the exact AWS console steps screen by screen
3. I help you choose between App Runner, EC2, ECS, and Elastic Beanstalk

## 14. Console walkthrough (copy-paste flow)

### 14.1 Create backend service (App Runner)

1. Open AWS Console -> App Runner -> Create service.
2. Source and deployment:

- Source: Source code repository
- Provider: GitHub
- Repository: `shaksham08/Project-Cactus`
- Branch: `main`
- Deployment trigger: Automatic (recommended)

3. Configuration:

- Use configuration file: Yes
- Config file path: `apprunner.yaml`

4. Service settings:

- Service name: `project-cactus-backend`
- Port: leave as defined in file (`5000`)

5. Environment variables (runtime):

- `PORT=5000`
- `MONGODB_URI=<your-uri>`
- `JWT_SECRET=<your-secret>`
- `CLIENT_URL=https://placeholder.example.com` (update after frontend deploy)

6. Create service and wait until status is Running.
7. Open `https://<apprunner-domain>/api/health` and confirm success response.

### 14.2 Create frontend app (Amplify)

1. Open AWS Console -> Amplify -> Host web app.
2. Connect GitHub repo:

- Repository: `shaksham08/Project-Cactus`
- Branch: `main`

3. App settings:

- Monorepo app root: `cactus-frontend`
- Build settings: keep default so Amplify reads root `amplify.yml`

4. Environment variables:

- `VITE_API_BASE_URL=https://<apprunner-domain>/api`

5. Save and deploy.
6. Wait for build to complete and open the Amplify app URL.

### 14.3 Final CORS wiring

1. Copy Amplify frontend URL (for example `https://main.xxxxxx.amplifyapp.com`).
2. Go back to App Runner -> your backend service -> Configuration -> Runtime environment variables.
3. Update `CLIENT_URL` to the exact Amplify URL.
4. Redeploy backend service.

### 14.4 Smoke test

1. Open frontend URL.
2. Register and log in.
3. Create todo, note, and one test.
4. Confirm no CORS or network errors in browser dev tools.
