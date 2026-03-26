# Dev-Path

Dev-Path is a full-stack learning platform for software engineering career tracks.
It combines guided roadmaps, lesson content, coding/theory assessments, streak/progress tracking, leaderboard ranking, events, and job applications.

This project won 6th place in the National IT Competition in Blagoevgrad 2026.

## What The App Does

### For learners
- Sign up, verify email, and choose a learning path.
- Follow structured roadmaps and milestone-based lessons.
- Practice with coding tasks and theory quizzes.
- Track lecture progress and daily streaks.
- Unlock AI-generated hard challenges after solving enough tasks.
- Browse jobs filtered by selected path and submit applications.
- View leaderboard rankings.
- Browse upcoming events.

### For admins
- Manage roadmaps, milestones, and lessons.
- Edit lesson content (overview, goal, topics, sections, resources).
- Create/update coding and theory tasks.
- Publish jobs.
- Create/delete events.

## Tech Stack

### Frontend
- React 19 + Vite 7
- React Router
- Tailwind CSS 4
- Framer Motion
- i18next / react-i18next (English + Bulgarian support)
- Lucide icons

### Backend
- FastAPI
- SQLAlchemy ORM
- Alembic migrations
- PostgreSQL (default target, e.g. Supabase)
- Argon2 password hashing
- Mailjet (email verification)
- AI integration:
	- Google Gemini via `google-genai`
	- Qwen via local `ollama`

### Testing
- pytest
- FastAPI TestClient
- SQLite test database (`backend/test_api.db`)

## Repository Structure

```text
Dev-Path/
├─ frontend/                     # React client app
│  ├─ src/pages/                 # Main screens (dashboard, lesson, admin, etc.)
│  ├─ src/components/            # Reusable UI and layout components
│  ├─ src/context/               # Auth + theme providers
│  ├─ src/data/                  # Roadmaps, lesson content, translations
│  └─ src/services/              # Bootstrap and client services
│
├─ backend/                      # FastAPI server
│  ├─ main.py                    # App composition + legacy/global endpoints
│  ├─ users.py                   # Re-export of user router
│  ├─ api_router/                # Users, learning, admin routers
│  ├─ db/models/                 # SQLAlchemy models
│  ├─ db/alembic/                # Migration environment + revisions
│  ├─ public/                    # Built frontend assets served by FastAPI
│  ├─ tests/                     # Backend API tests
│  └─ generate_*.py              # AI-assisted lesson/assessment generation tools
│
└─ README.md
```

## Core Runtime Flows

## 1) Auth + onboarding
1. User signs up with `/signin`.
2. Verification email sent via Mailjet.
3. User verifies via `/api/verify-email?token=...`.
4. User logs in via `/login`.
5. Path is selected and persisted via `/update-path`.

## 2) Learning
1. Frontend bootstraps roadmap data by calling `/learning/bootstrap` (once, cached in browser).
2. Dashboard loads progress with `/learning/dashboard/{userId}`.
3. Lesson page loads full bundle via `/learning/lesson/{pathId}/{lectureId}`.
4. Coding submissions go through `/submit-code` (optional AI correctness + improvement tips).
5. Theory results persist with `/learning/progress/complete-theory-test`.
6. Lecture progress updates via `/learning/progress/complete-lesson` or `/update-lecture`.

## 3) Career layer
- Jobs list via `/jobs`.
- Application submit via `/applications`.
- User application history via `/user/{user_id}/applications`.
- Events list via `/events`.

## 4) Admin layer
- Uses `/admin/*` endpoints protected by `X-Admin-Key` header.
- Manages roadmaps, lesson content, tasks, jobs, and events.

## API Overview

## Auth & user (`backend/api_router/users.py`)
- `POST /signin`
- `POST /login`
- `GET /user/{user_id}`
- `POST /update-path`
- `POST /update-lecture`
- `POST /update-streak`
- `POST /applications`
- `GET /user/{user_id}/applications`
- `GET /api/verify-email`

## Learning (`backend/api_router/learning.py`)
- `POST /learning/bootstrap`
- `POST /learning/assessments/backfill`
- `GET /learning/roadmaps`
- `GET /learning/roadmaps/{path_id}`
- `GET /learning/lesson/{path_id}/{lecture_id}`
- `GET /learning/dashboard/{user_id}`
- `GET /learning/dashboard/hard-challenge/{user_id}`
- `POST /learning/progress/complete-lesson`
- `POST /learning/progress/complete-theory-test`
- `GET /learning/leaderboard`

## Admin (`backend/api_router/admin.py`, requires `X-Admin-Key`)
- `GET /admin/roadmaps`
- `GET /admin/roadmaps/{path_id}`
- `PUT /admin/roadmaps/{path_id}`
- `PUT /admin/lessons/{path_id}/{lecture_id}`
- `GET /admin/tasks/{path_id}/{lecture_id}`
- `POST /admin/tasks/{path_id}/{lecture_id}`
- `PUT /admin/tasks/{task_id}`
- `POST /admin/jobs`
- `GET /admin/events`
- `POST /admin/events`
- `DELETE /admin/events/{event_id}`

## Main app-level endpoints (`backend/main.py`)
- `GET /`
- `POST /dashboard-coding-challenge`
- `POST /submit-code`
- `GET /jobs`
- `GET /events`
- `POST /roadmap-assessments/seed`
- `GET /roadmap-assessments/{path_id}/{lecture_id}`

## Data Model (High-Level)

Main SQLAlchemy tables:
- `users`
- `roadmaps`
- `roadmap_nodes` (milestones + lessons)
- `lessons`
- `tasks`
- `user_lesson_progress`
- `user_task_progress`
- `user_theory_test_results`
- `jobs`
- `events`
- `user_applications`

Relationships are designed around:
- A roadmap having milestone and lesson nodes.
- A lesson linking to tasks.
- User progress tracked separately for lessons, tasks, and theory tests.

## Environment Variables

Create `backend/.env` based on `backend/.env.example`.

Required (common setup):

```env
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<db>
AI_PROVIDER=google
GEMINI_API_KEY=<your_key>
```

Optional / feature-specific:

```env
# AI alternative
AI_PROVIDER=qwen

# Frontend origin used in email verification links
FRONTEND_BASE_URL=http://localhost:5173

# Admin API key (for /admin/* endpoints)
ADMIN_PANEL_KEY=admin123

# Mailjet email verification
MAILJET_API_KEY=<mailjet_key>
MAILJET_API_SECRET=<mailjet_secret>

# Optional startup behavior
AUTO_DB_CREATE_ON_STARTUP=false

# Optional Argon2 tuning
ARGON2_TIME_COST=2
ARGON2_MEMORY_COST=19456
ARGON2_PARALLELISM=1

# Optional jobs ingestion utility (job_api.py)
SERPAPI_API_KEY=<serpapi_key>
```

Frontend env (`frontend/.env`):

```env
VITE_BACKEND_URL=http://localhost:8000
```

## Local Development Setup

## 1) Backend setup

```bash
cd backend
python -m venv .venv
# Windows
.venv\Scripts\activate

pip install -r requirements.txt
```

Run migrations:

```bash
alembic -c db/alembic.ini upgrade head
```

Run API server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

## 2) Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Frontend dev server defaults to `http://localhost:5173`.

## 3) Access
- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:8000`

## Production Build Notes

Build frontend:

```bash
cd frontend
npm run build
```

The backend serves static files from `backend/public`.
To ship a single service, copy build artifacts (`frontend/dist/*`) into `backend/public`.

## Useful Backend Scripts

From `backend/`:

```bash
# Seed demo jobs
python seed_jobs.py

# Export learning DB content to JSON
python export_learning_data.py

# Generate lesson content with AI
python generate_all_lessons.py

# Generate coding/theory assessments with AI
python generate_all_roadmap_assessments.py

# Targeted generation (see --help)
python generate_specific_lessons.py --help
python generate_specific_assessments.py --help

# Quick env check
python test_env.py
```

## Testing

Run backend API flow tests:

```bash
cd backend
pytest tests/test_api_flows.py -q
```

Current tests cover:
- Admin key protection.
- Events endpoint response shape.
- Application submit/list flow + duplicate prevention.
- Theory-test result persistence.
- Streak increment/reset logic.

## Internationalization

- i18n is initialized in `frontend/src/i18n.js`.
- Translation source is `frontend/src/data/translations.bg.sections.json`.
- Language preference is stored in localStorage as `app-language`.

## Local Storage Keys Used By Frontend

- `user` (auth/session payload)
- `theme`
- `app-language`
- `admin_panel_key`
- `learning-bootstrap-v2` (bootstrap marker)
- `hard-challenge-prompt:<userId>:<tasksSolved>` (prompt cache)

## Security Notes

- Do not commit secrets in `.env`, migration configs, or logs.
- Rotate any credentials that were accidentally committed.
- `admin_panel_key` in browser localStorage is acceptable for prototype/demo setups, but should be replaced with proper server-side admin auth in production.
- Restrict CORS and origins for production deployments.

## Known Implementation Notes

- Authentication is localStorage/session-based in frontend (no JWT currently).
- Admin authorization uses `X-Admin-Key` header.
- Jobs are fetched globally and filtered client-side by selected path.
- Learning bootstrap is async on app load and can run before user navigation completes.

## Roadmap For Improvements

- Replace admin key mechanism with real role-based auth/JWT.
- Add user token/session expiration and refresh strategy.
- Add server-side filtering/pagination for jobs/events.
- Expand test coverage for learning/admin endpoints and frontend integration.
- Add CI workflow for lint, tests, and migration checks.
