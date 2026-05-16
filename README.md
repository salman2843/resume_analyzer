# AI Resume Analyzer SaaS

Full-stack resume analysis SaaS built with React, Express, TypeScript, PostgreSQL, and Prisma.

The project currently supports authentication, protected dashboard access, PDF resume upload, PDF text extraction, and user-specific resume history.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios
- Backend: Express, TypeScript, Prisma, PostgreSQL
- Auth: JWT access token stored on the client
- Uploads: Multer for PDF uploads
- PDF parsing: `pdf-parse`
- Database: PostgreSQL through Prisma

## Project Structure

```txt
client/   React + Vite frontend
server/   Express + Prisma backend
```

Important folders:

```txt
client/src/pages/          App pages such as login, register, dashboard
client/src/context/        Auth context and session state
client/src/services/       API clients for auth and resumes
server/src/controllers/    Request handlers
server/src/routes/         API routes
server/src/middleware/     Auth and error middleware
server/prisma/             Prisma schema and migrations
server/uploads/            Uploaded resume PDFs during local development
```

## Completed So Far

- Monorepo setup with `client` and `server` workspaces
- React app shell with landing, login, register, and protected dashboard pages
- Client-side auth context
- Login/register forms with client-side validation
- JWT-based backend authentication
- PostgreSQL database connection through Prisma
- Prisma models for users, resumes, analyses, and interview sessions
- Protected dashboard route
- Profile dropdown in the navbar with dashboard and logout options
- Logout confirmation dialog
- Protected resume upload API
- PDF-only upload validation
- Resume files saved under `server/uploads/resumes`
- PDF text extraction saved to the database
- Resume history UI showing uploaded PDF names and upload dates

## Database Setup

The backend expects PostgreSQL to be running while developing.

Create a database named `resume_analyzer`.

Example Docker setup:

```powershell
docker run --name resume-postgres `
  -e POSTGRES_PASSWORD=postgres `
  -e POSTGRES_DB=resume_analyzer `
  -p 5432:5432 `
  -d postgres:16
```

After restarting your machine, start the database again with:

```powershell
docker start resume-postgres
```

If using a locally installed PostgreSQL server:

```powershell
createdb -U postgres resume_analyzer
```

## Environment Variables

Create `server/.env` using `server/.env.example` as the template.

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/resume_analyzer
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=http://localhost:5173
OPENAI_API_KEY=
GEMINI_API_KEY=
```

## Install Dependencies

From the project root:

```powershell
npm install
```

## Prisma Commands

Generate the Prisma client:

```powershell
npm run prisma:generate --workspace server
```

Apply migrations:

```powershell
npm run prisma:migrate --workspace server
```

Current tables include:

- `"User"`
- `"Resume"`
- `"Analysis"`
- `"InterviewSession"`

PostgreSQL table names are case-sensitive because Prisma created PascalCase table names, so query them with quotes:

```sql
SELECT * FROM "User";
SELECT * FROM "Resume";
```

## Run Locally

Start the backend:

```powershell
npm run dev:server
```

Start the frontend in another terminal:

```powershell
npm run dev:client
```

Frontend:

```txt
http://localhost:5173
```

Backend API:

```txt
http://localhost:5000/api
```

## Available Scripts

From the project root:

```powershell
npm run dev:client
npm run dev:server
npm run build:client
npm run build:server
npm run build
npm run lint
```

## Current API Surface

Auth routes:

```txt
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

Resume routes:

```txt
GET  /api/resumes
POST /api/resumes
```

`POST /api/resumes` expects multipart form data with the file field named:

```txt
resume
```

## Resume Upload Flow

1. User logs in or registers.
2. Frontend stores the JWT token in `localStorage`.
3. Dashboard calls protected resume APIs with the token.
4. User uploads a PDF resume.
5. Backend validates the file type and size.
6. Backend saves the PDF in `server/uploads/resumes`.
7. Backend extracts text from the PDF.
8. Backend creates a `"Resume"` row linked to the logged-in user.
9. Dashboard shows the uploaded PDF in resume history.

## Build Checks

Client build:

```powershell
npm run build:client
```

Server build:

```powershell
npm run build:server
```

## Next Planned Work

- Add resume delete/download actions
- Add analysis generation using extracted resume text
- Store ATS score and suggestions in the `Analysis` table
- Show analysis results on the dashboard
- Add profile/account page links inside the profile menu
