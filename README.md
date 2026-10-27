# BITverse — Build It Together

A collaborative system-design sandbox. Design architectures, simulate failures, track decisions.

---

## Quick start

### 1 — Install

```bash
npm install --legacy-peer-deps
```

### 2 — Configure environment

```bash
cp .env.example server/.env
# Edit server/.env — defaults work for local SQLite dev without changes
cp client/.env.example client/.env
```

### 3 — Database setup (SQLite — no Docker required)

```bash
cd server
node_modules/.bin/prisma migrate dev --name init   # creates server/dev.db
npm run db:seed                                     # seeds demo users + workspace
cd ..
```

### 4 — Run

Open two terminals:

```bash
# Terminal 1 — backend (HTTP + WebSocket)
npm run dev:server

# Terminal 2 — frontend
npm run dev
```

- Frontend: **http://localhost:5173**
- Backend:  **http://localhost:3001**
- Health:   **http://localhost:3001/health**

---

## Production (PostgreSQL + Docker)

```bash
docker compose up -d               # starts postgres on :5432
# Set DATABASE_URL in server/.env to postgresql://bitverse:bitverse@localhost:5432/bitverse
npm run server:migrate             # runs prisma migrate deploy
npm run server:seed
npm run build                      # builds client/dist
npm run build:server               # compiles server to server/dist
node server/dist/index.js
```

---

## Environment variables

| Variable | Default | Required |
|---|---|---|
| `DATABASE_URL` | `file:./dev.db` | ✅ |
| `JWT_SECRET` | — | ✅ (≥32 chars) |
| `JWT_EXPIRES_IN` | `7d` | |
| `PORT` | `3001` | |
| `CORS_ORIGINS` | `http://localhost:5173` | |
| `WS_PORT` | `3002` | (unused — WS shares PORT) |
| `VITE_API_URL` | `http://localhost:3001` | client |
| `VITE_WS_URL` | `ws://localhost:3001` | client |

---

## API routes

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Create account |
| POST | `/api/auth/login` | — | Login → JWT |
| GET | `/api/auth/me` | ✅ | Current user |
| GET | `/api/workspaces` | ✅ | List my workspaces |
| POST | `/api/workspaces` | ✅ | Create workspace |
| GET | `/api/workspaces/:id` | ✅ member | Read workspace + members |
| PATCH | `/api/workspaces/:id` | ✅ member | Save graph / metadata |
| DELETE | `/api/workspaces/:id` | ✅ owner | Delete workspace |
| POST | `/api/workspaces/:id/members` | ✅ owner | Invite user by email |
| GET | `/api/workspaces/:id/snapshots` | ✅ member | List snapshots |
| POST | `/api/workspaces/:id/snapshots` | ✅ member | Save named snapshot |
| GET | `/api/workspaces/:id/snapshots/:sid` | ✅ member | Read snapshot graph |
| POST | `/api/workspaces/:id/snapshots/:sid/restore` | ✅ member | Restore snapshot |
| GET | `/api/workspaces/:id/queries` | ✅ member | List queries |
| POST | `/api/workspaces/:id/queries` | ✅ member | Create query |
| PATCH | `/api/workspaces/:id/queries/:qid` | ✅ member | Update status |
| POST | `/api/workspaces/:id/queries/:qid/replies` | ✅ member | Add reply |
| POST | `/api/workspaces/:id/challenges` | ✅ member | Record simulation attempt |
| GET | `/api/workspaces/:id/challenges` | ✅ member | Simulation history |
| GET | `/health` | — | DB connectivity check |

WebSocket collab: `ws://localhost:3001/collab/:workspaceId?token=JWT`

---

## Demo credentials (after seeding)

```
aanya@bitverse.dev / password123   (workspace owner)
rohan@bitverse.dev / password123   (editor)
```

---

## Tests

```bash
npm run test:server        # runs all 22 server tests (vitest)
```

Covers: auth (register/login/me), workspace CRUD, access control, snapshot save/restore/persistence.

---

## Run commands summary

| Command | What it does |
|---|---|
| `npm install --legacy-peer-deps` | Install all deps |
| `npm run dev` | Start Vite frontend |
| `npm run dev:server` | Start Express backend |
| `npm run build` | Build frontend |
| `npm run typecheck` | TypeScript check (client + server) |
| `npm run test:server` | Run server tests |
| `npm run server:migrate` | Run Prisma migrations |
| `npm run server:seed` | Seed demo data |

---

## What's implemented vs deferred

### ✅ Implemented & verified

- **Backend**: Express + Prisma + SQLite/PostgreSQL, JWT auth, Zod validation, Helmet/CORS
- **Auth**: Register, login, JWT, `/me` endpoint — fully tested
- **Workspace API**: Full CRUD, membership, role-based auth (owner/editor) — fully tested
- **Snapshots**: Save, list, read, restore — survives server restart — fully tested
- **Queries + replies**: Create, update status, reply, auto-transition — route complete
- **Challenge records**: Record simulation attempts, list history — route complete
- **Yjs WebSocket server**: `ws://.../collab/:workspaceId?token=JWT` — authentication, room isolation, doc sync, awareness
- **Client API client**: Typed `api.*` namespace, token management, `ApiClientError`
- **Auth store**: login/register/logout/checkAuth, server status probe
- **Workspace sync**: Debounced PATCH on graph change, create-on-first-auth
- **Collab session**: `startCollabSession()` wires Yjs ↔ Zustand store bidirectionally
- **Auth UI**: Login/register modal on landing, dashboard, workspace — demo credential shortcut
- **localStorage fallback**: All edits persist locally regardless of server status

### 🟡 Implemented but not load-tested

- Yjs collaboration: wired end-to-end; two-client test requires a running browser session
- Query/challenge frontend hooks: API client ready; UI components still write to local store only (next step: swap store actions to call API)

### ❌ Deferred

- **WebRTC proximity audio**: Requires explicit microphone permission + peer lifecycle management. Signalling architecture documented; not implemented to avoid fake working controls.
- **Yjs persistence adapter**: Server holds Y.Doc in memory; restarts lose in-flight collab state. Fix: flush Yjs update to Snapshot table on WebSocket disconnect.
- **Frontend query/challenge API integration**: Local store actions need to call `api.queries.*` and `api.challenges.*` after each mutation (scaffolding done, wiring deferred).
- **Workspace list loading on Dashboard**: Currently shows localStorage workspace; needs `api.workspaces.list()` call on mount when authenticated.
