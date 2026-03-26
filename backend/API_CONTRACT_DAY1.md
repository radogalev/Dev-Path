# Day 1 API Contract Matrix

This file defines endpoint ownership and immediate gaps required by the Day 1 plan.

## Current Implemented Endpoints

### Auth and User (owner: `backend/api_router/users.py`)
- `POST /signin`
- `POST /login`
- `GET /user/{user_id}`
- `POST /update-path`
- `POST /update-lecture`
- `POST /update-streak`

### Learning (owner: `backend/api_router/learning.py`)
- `POST /learning/bootstrap`
- `POST /learning/assessments/backfill`
- `GET /learning/roadmaps`
- `GET /learning/roadmaps/{path_id}`
- `GET /learning/lesson/{path_id}/{lecture_id}`
- `GET /learning/dashboard/{user_id}`
- `POST /learning/progress/complete-lesson`

### Admin (owner: `backend/api_router/admin.py`)
- `GET /admin/roadmaps`
- `GET /admin/roadmaps/{path_id}`
- `PUT /admin/roadmaps/{path_id}`
- `PUT /admin/lessons/{path_id}/{lecture_id}`
- `GET /admin/tasks/{path_id}/{lecture_id}`
- `POST /admin/tasks/{path_id}/{lecture_id}`
- `PUT /admin/tasks/{task_id}`
- `POST /admin/jobs`

### App-Level Legacy Endpoints (owner: `backend/main.py`)
- `GET /`
- `POST /dashboard-coding-challenge`
- `POST /submit-code`
- `GET /jobs`
- `POST /roadmap-assessments/seed`
- `GET /roadmap-assessments/{path_id}/{lecture_id}`

## Day 1 Contract Gaps (Not Implemented Yet)

### Events
- `GET /events`
  - Used by frontend events listing.
  - Status: missing.
- `POST /admin/events`
  - Used by admin event management.
  - Status: missing.

### Applications
- `POST /applications`
  - Used by `ApplicationForm` submit.
  - Status: missing.
- `GET /user/{user_id}/applications`
  - Used by user profile/dashboard history.
  - Status: missing.

### Theory Test Result Persistence
- `POST /learning/progress/complete-theory-test` (proposed)
  - Suggested payload:
    - `userId: int`
    - `pathId: str`
    - `lectureId: int`
    - `score: int`
    - `totalQuestions: int`
    - `passed: bool`
  - Status: missing. Current flow only updates lecture progression.

## Routing Ownership Decisions

- Keep authentication and basic user updates in `users.py`.
- Keep learning progress/result endpoints in `learning.py`.
- Keep admin management under `/admin/*` in `admin.py`.
- Keep `main.py` as composition root and progressively move legacy app-level endpoints into dedicated routers.

## Day 1 Frontend Auth Baseline

Implemented in frontend:
- `AuthProvider` centralized user session state (`frontend/src/context/AuthContext.jsx`).
- `ProtectedRoute` guard for authenticated pages (`frontend/src/components/auth/ProtectedRoute.jsx`).
- Guarded route wiring in `frontend/src/App.jsx`.
- Login writes through auth context (`frontend/src/pages/Login.jsx`).
