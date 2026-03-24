# Cactus Backend

Node.js and Express backend for a learning platform that supports:

- user accounts with JWT authentication
- MCQ test creation and submission
- learning progress tracking
- personal todo management
- text document storage for editor-based note taking
- resource link storage for YouTube videos, blogs, and other learning material

## Tech stack

- Express.js
- MongoDB with Mongoose
- JWT authentication
- Express Validator

## Project structure

```text
src/
  app.js
  server.js
  config/
  controllers/
  middlewares/
  models/
  routes/
  utils/
  validators/
```

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create an environment file:

```bash
copy .env.example .env
```

3. Update the values in `.env`.

4. Start the API:

```bash
npm run dev
```

## Main API routes

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/tests`
- `GET /api/tests/attempts/history`
- `POST /api/tests`
- `GET /api/tests/:testId`
- `PATCH /api/tests/:testId`
- `DELETE /api/tests/:testId`
- `POST /api/tests/:testId/submit`
- `GET /api/progress`
- `POST /api/progress`
- `PATCH /api/progress/:progressId`
- `DELETE /api/progress/:progressId`
- `GET /api/todos`
- `POST /api/todos`
- `PATCH /api/todos/:todoId`
- `DELETE /api/todos/:todoId`
- `GET /api/documents`
- `POST /api/documents`
- `PATCH /api/documents/:documentId`
- `DELETE /api/documents/:documentId`
- `GET /api/resources`
- `POST /api/resources`
- `PATCH /api/resources/:resourceId`
- `DELETE /api/resources/:resourceId`

## Notes for the future frontend

The document API stores text content and metadata only. A React frontend can use Monaco Editor or any rich text or code editor and persist the editor contents through the document endpoints.
