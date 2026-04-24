# Cactus Backend

Backend API for the Cactus learning platform.

It provides:

- JWT-based user authentication
- MCQ test creation, updates, submissions, attempt history, and leaderboard
- Learning progress tracking
- Personal todo management
- Document storage for editor notes
- Learning resource link management

## Tech Stack

- Node.js
- Express.js
- MongoDB + Mongoose
- JWT (`jsonwebtoken`)
- Validation via `express-validator`

## Project Structure

```text
src/
  app.js
  server.js
  config/
    db.js
  controllers/
  middlewares/
  models/
  routes/
  utils/
  validators/
```

## Getting Started

1. Install dependencies.

```bash
npm install
```

2. Create your local environment file.

```bash
copy .env.example .env
```

3. Update `.env` values.

4. Start the development server.

```bash
npm run dev
```

Server default URL: `http://localhost:5000`

## Environment Variables

Use `.env.example` as the template.

| Variable      | Required | Description                         |
| ------------- | -------- | ----------------------------------- |
| `PORT`        | No       | API port (defaults to `5000`)       |
| `MONGODB_URI` | Yes      | MongoDB connection string           |
| `JWT_SECRET`  | Yes      | Secret used to sign and verify JWTs |
| `CLIENT_URL`  | No       | Allowed frontend origin for CORS    |

## NPM Scripts

- `npm run dev` - Start server with `nodemon`
- `npm start` - Start server in normal mode
- `npm test` - Placeholder script (no automated tests configured yet)

## API Base Path

- Base URL: `http://localhost:5000`
- API prefix: `/api`
- Health check: `GET /api/health`

## Authentication

Protected routes require a Bearer token in the `Authorization` header:

```http
Authorization: Bearer <jwt_token>
```

## Route Map

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (protected)

### Tests (all protected)

- `GET /api/tests`
- `POST /api/tests`
- `GET /api/tests/:testId`
- `PATCH /api/tests/:testId`
- `DELETE /api/tests/:testId`
- `POST /api/tests/:testId/submit`
- `GET /api/tests/:testId/leaderboard`
- `GET /api/tests/attempts/history`
- `GET /api/tests/attempts/:attemptId`

### Progress (all protected)

- `GET /api/progress`
- `POST /api/progress`
- `PATCH /api/progress/:progressId`
- `DELETE /api/progress/:progressId`

### Todos (all protected)

- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:todoId`
- `DELETE /api/todos/:todoId`

### Documents (all protected)

- `GET /api/documents`
- `POST /api/documents`
- `PATCH /api/documents/:documentId`
- `DELETE /api/documents/:documentId`

### Resources (all protected)

- `GET /api/resources`
- `POST /api/resources`
- `PATCH /api/resources/:resourceId`
- `DELETE /api/resources/:resourceId`

## Notes for Frontend Integration

- Most responses follow this shape: `{ success, data }`.
- Auth endpoints return both user data and token.
- The document API stores text content and metadata, so any rich text/code editor frontend can persist content through these endpoints.
