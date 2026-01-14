# Pro Resume Builder

A modern resume builder with a clean editor experience, multi-format resume upload, and an API-backed data model you can persist per user.

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat-square&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=flat-square&logo=docker&logoColor=white)

---

## Highlights

- **Resume editor + live preview**: Build a structured resume (summary, skills, experience, education, projects, certifications).
- **Smart upload parsing**: Upload `PDF/DOC/DOCX/HTML/RTF/TXT` and review extracted text + mapped fields.
- **Projects extractor**: Convert a raw “Projects” section into a structured list via an API helper.
- **Brand analyzer**: Score role alignment against job keywords and suggest what to add/emphasize.
- **Bullet impact scoring**: Heuristic scoring + one-click suggestions for stronger action/metrics.
- **STAR answer scorer**: Quick feedback for interview practice (Situation/Task/Action/Result coverage).
- **Authentication**: Email/password + Google OAuth (JWT-based API auth).

---

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Axios

### Backend API

- Node.js + Express
- MongoDB (Mongoose)
- JWT auth
- Multer uploads + local text extraction (PDF, DOCX, HTML/RTF/TXT)

### Services (optional / microservices)

- `parse-service` (FastAPI): parsing + (optional) LLM-based optimization
- `renderer` (Node + Puppeteer): HTML-to-PDF rendering service
- Nginx: serves the built frontend and proxies `/api` to the backend in Docker

---

## Architecture

```text
Browser
  │
  │  (Vite dev server or Nginx)
  ▼
Frontend (React)
  │
  │  /api/*
  ▼
Backend API (Express, :3001) ────────────┐
  │                                      │
  │ persists                             │ optional
  ▼                                      ▼
MongoDB                              Parser (:8000) / Renderer (:4000)
```

Notes:

- In local dev, Vite proxies `/api` requests to `http://localhost:3001`.
- In Docker, Nginx (frontend) proxies `/api` to the `api` container.

---

## Project Structure

```text
.
├─ src/                   # Frontend (React)
├─ backend/               # Backend API (Express + TS)
├─ parse-service/         # FastAPI resume parser/optimizer
├─ renderer/              # Puppeteer PDF renderer service
├─ docker-compose.yml     # Full stack orchestration
├─ Dockerfile.frontend    # Builds + serves frontend via Nginx
└─ nginx.conf             # Nginx config (SPA routing + /api proxy)
```

---

## Quick Start (Recommended): Docker

Prerequisites:

- Node.js 18+ (for non-Docker dev)
- Docker + Docker Compose

1) Create environment files:

- `env.example` → `.env`
- `backend/env.example` → `backend/.env`

2) Start everything:

```bash
docker compose up --build
```

Services:

- Frontend: `http://localhost:3000`
- API: `http://localhost:3001`
- Parser: `http://localhost:8000`
- Renderer: `http://localhost:4000`

---

## Local Development (without Docker)

You’ll typically run frontend + backend together.

### 1) Frontend

```bash
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.

### 2) Backend API

```bash
npm install
npm run dev
```

Run this inside `backend/`. The API runs at `http://localhost:3001`.

### 3) MongoDB

You need a MongoDB instance and a valid `MONGODB_URI` in `backend/.env`.

### 4) (Optional) Parser service

```bash
pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Run this inside `parse-service/`.

### 5) (Optional) Renderer service

```bash
npm install
node index.js
```

Run this inside `renderer/`.

---

## Environment Variables

### Frontend (`.env`)

```env
VITE_API_URL=http://localhost:3001
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Backend (`backend/.env`)

```env
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

MONGODB_URI=mongodb://localhost:27017/resume-builder

GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long
JWT_EXPIRY=7d
```

---

## API Overview

Base URL (local): `http://localhost:3001`

- `POST /api/upload`
  - Upload resume file under `resume` (multipart)
  - Returns parsed `ResumeData` plus `extractedText`
- `POST /api/projects-extractor`
  - Input: `{ "text": "..." }`
  - Output: `{ "projects": [...] }`
- `POST /api/brand-analyzer`
  - Input: `{ targetRole, resume }`
  - Output: brand alignment score + missing keywords
- `POST /api/auth/register`, `POST /api/auth/login`, `POST /api/auth/google/callback`
- `GET /api/resume`, `POST /api/resume` (protected: requires `Authorization: Bearer <token>`)

---

## Troubleshooting

- **CORS errors**
  - Ensure `backend/.env` has `FRONTEND_URL=http://localhost:5173` (or your current Vite port).
- **401 Unauthorized on `/api/resume`**
  - You must be authenticated and send `Authorization: Bearer <token>` (stored in localStorage by the frontend).
- **Renderer takes time on first start**
  - Puppeteer downloads Chromium on first run; allow 1–2 minutes.

---

## Contributing

- Create a feature branch
- Keep changes small and focused
- Open a PR with clear screenshots or notes

---

## License

MIT — see `LICENSE`.
