# PostgreSQL Migration Plan

## Step 1: Docker + .env
- Create `docker-compose.yml` at project root with Postgres 16 (port 5432, db=internshala, user=app, pass=app123)
- Create `backend/.env` with DATABASE_URL, JWT_SECRET, ADZUNA keys, GOOGLE_CLIENT_ID

## Step 2: Install backend deps
```
npm install pg dotenv bcryptjs jsonwebtoken cookie-parser
```

## Step 3: DB layer files
- `backend/db/pool.js` — pg Pool from DATABASE_URL
- `backend/db/init.sql` — all CREATE TABLE IF NOT EXISTS statements (users, profiles, jobs, saved_jobs, applied_jobs + indexes)
- `backend/db/seed.js` — reads existing jobs.json, bulk inserts into jobs table

## Step 4: Route files
- `backend/routes/auth.js` — register/login/google/logout/me (bcrypt, JWT, httpOnly cookie)
- `backend/routes/profile.js` — PUT /api/profile (upsert profiles row)
- `backend/routes/saved.js` — GET/POST/DELETE /api/saved/:jobId
- `backend/routes/applied.js` — GET/POST /api/applied/:jobId
- Rewrite `backend/routes/jobs.js` — SQL queries instead of JSON file reads, add pagination
- `backend/routes/resume.js` — GET/PUT /api/resume (reads/writes resume_info JSONB from profiles)

## Step 5: Update server.js + scraper
- `server.js` — mount new routes, run init.sql on boot, connect pool
- Scraper (`index.js`, `adzuna.js`, `mncJobs.js`) — write to PostgreSQL instead of jobs.json
- Remove `initJobs` file-check; replace with DB row count check

## Step 6: Frontend — mockApi.js
- Remove ALL localStorage reads/writes
- Every method calls the new backend endpoints
- authService.login/register/googleAuth/logout/getCurrentUser/updateProfile
- jobService.getAllJobs/getJobById/getSavedJobIds/saveJob/unsaveJob/getAppliedJobIds/applyToJob
- resumeService.getResume/saveResume

## Step 7: Frontend — AuthContext.jsx
- Remove session restoration from localStorage
- On mount: call `GET /api/auth/me` — if 200, set user; if 401, user is null
- logout() calls `POST /api/auth/logout` which clears the cookie

## Step 8: Frontend — JobContext.jsx
- saved/applied job operations call new backend routes instead of localStorage
- Everything else stays the same (filtering is already client-side from the full job list)

## Step 9: Verify
- `npx vite build` — confirm clean build
- Start Docker postgres, run seed, test endpoints
