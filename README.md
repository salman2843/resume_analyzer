# AI Resume Analyzer SaaS

Full-stack resume analysis SaaS built with React, Express, TypeScript, PostgreSQL, Prisma, and Gemini.

The project currently supports authentication, protected dashboard access, PDF resume upload, PDF text extraction, Gemini-powered resume analysis, saved analysis reports, resume-based interview question generation, and deployment to Vercel + Render.

## Tech Stack

- Frontend: React, Vite, TypeScript, Tailwind CSS, React Router, Axios, Recharts, Lucide React, Framer Motion
- Backend: Express, TypeScript, Prisma, PostgreSQL
- Auth: JWT access token stored on the client
- Uploads: Multer for PDF uploads
- PDF parsing: `pdf-parse`
- AI: Gemini for resume analysis and interview question generation
- Database: PostgreSQL through Prisma

## Project Structure

```txt
client/   React + Vite frontend
server/   Express + Prisma backend
```

Important folders:

```txt
client/src/pages/          App pages such as landing, login, dashboard, analysis, results, interview practice
client/src/components/     Shared UI such as analysis loading and resume reports
client/src/context/        Auth context and session state
client/src/services/       API clients for auth and resumes
server/src/controllers/    Request handlers
server/src/routes/         API routes
server/src/services/       AI service integrations
server/src/middleware/     Auth and error middleware
server/prisma/             Prisma schema and migrations
server/uploads/            Uploaded resume PDFs during local development
```

## Completed So Far

- Monorepo setup with `client` and `server` workspaces
- React app shell with landing, login, register, and protected dashboard pages
- Dynamic root page:
  - Logged-out users see a product landing page
  - Logged-in users see a career home with latest analyzed resume preview and quick actions
- Client-side auth context
- Login/register forms with client-side validation
- JWT-based backend authentication
- PostgreSQL database connection through Prisma
- Prisma models for users, resumes, analyses, and interview sessions
- Protected dashboard and module routes
- Profile dropdown in the navbar with dashboard, analysis, interview, job match, and logout options
- Logout confirmation dialog
- Protected resume upload API
- PDF-only upload validation
- Resume files saved under `server/uploads/resumes`
- PDF text extraction saved to the database
- Resume history UI showing uploaded PDF names and upload dates
- Dashboard modules for analysis, results, interview practice, and job matching
- Gemini-powered resume analysis endpoint
- Saved resume reports with ATS score, strengths, weaknesses, suggestions, and job match score
- Redesigned results page with score badge, stat pills, strengths/fixes cards, suggestions, CTAs, and collapsible score details
- Gemini-powered interview question generation
- Saved interview question sessions linked to resumes
- Interview practice page with FAQ-style answer toggles and generate-more flow
- Placeholder job match workspace ready for future matching implementation
- Deployment flow tested with backend on Render, PostgreSQL on Render, and frontend on Vercel

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
GEMINI_MODEL=gemini-2.5-flash-lite
```

Client environment variables for deployment or local frontend overrides:

```env
VITE_API_URL=http://localhost:5000/api
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
POST /api/resumes/:id/analyze
GET  /api/resumes/:id/interview-sessions
POST /api/resumes/:id/interview-questions
GET  /api/resumes/:id/download
DELETE /api/resumes/:id
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

## Resume Analysis Flow

1. User selects a resume and clicks analyze.
2. Frontend calls `POST /api/resumes/:id/analyze`.
3. Backend verifies the resume belongs to the authenticated user.
4. Backend sends extracted resume text to Gemini.
5. Gemini returns ATS score, strengths, weaknesses, suggestions, and job match score.
6. Backend saves report data in the `"Analysis"` table.
7. Backend updates the resume `atsScore` in the `"Resume"` table.
8. Frontend shows the saved result on the results page.

## Interview Practice Flow

1. User opens interview practice for a resume.
2. Frontend loads saved interview sessions with `GET /api/resumes/:id/interview-sessions`.
3. User clicks generate questions.
4. Frontend calls `POST /api/resumes/:id/interview-questions`.
5. Backend sends extracted resume text to Gemini.
6. Gemini returns exactly five resume-based questions with short sample answers.
7. Backend saves the generated set in the `"InterviewSession"` table.
8. Frontend displays questions in FAQ-style accordions.

## Deployment Notes

Current recommended deployment split:

```txt
Frontend: Vercel
Backend:  Render Web Service
Database: Render PostgreSQL
```

Backend Render environment variables:

```env
DATABASE_URL=render-postgres-internal-url
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_URL=https://your-vercel-app.vercel.app
GEMINI_API_KEY=your-gemini-key
GEMINI_MODEL=gemini-2.5-flash-lite
NODE_ENV=production
```

Frontend Vercel environment variables:

```env
VITE_API_URL=https://your-render-backend.onrender.com/api
```

Render backend build command:

```bash
npm install && npm run prisma:generate && npx prisma migrate deploy && npm run build
```

Render backend start command:

```bash
npm run start
```

Vercel frontend settings:

```txt
Root directory: client
Framework: Vite
Build command: npm run build
Output directory: dist
```

Important: `CLIENT_URL` must not include a trailing slash because CORS origin matching is exact.

Uploaded PDFs are currently stored on the backend filesystem under `server/uploads/resumes`. This is acceptable for local development and staging, but production should move uploads to persistent object storage such as S3, Cloudinary, Supabase Storage, or Render persistent disk.

## Build Checks

Client build:

```powershell
npm run build:client
```

Server build:

```powershell
npm run build:server
```

Full workspace build:

```powershell
npm run build
```
