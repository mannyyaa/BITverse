# BITverse — Build It Together

BITverse is a collaborative system-design sandbox for mapping architecture, discussing design decisions, and exploring failure scenarios.

## Run the frontend

Run these commands from the repository root:

```bash
npm install
npm run dev
```

Vite serves the active frontend at `http://localhost:5173` (or prints another local URL if that port is busy).

Useful commands:

```bash
npm run build       # TypeScript project build + Vite production build for client/
npm run typecheck   # Type-check the client project
```

## Repository layout

```text
client/   Active React + TypeScript + Vite frontend
server/   Reserved for the future backend phase; currently a placeholder
src/      Legacy root-level snapshot retained temporarily during the client/ migration
```

**Use `client/src/` for frontend work.** The root `package.json` runs the `client` workspace, so root-level `src/` is not the active Vite entry point. Keep the duplicate root files until the client build has been verified and you are ready to clean up the repository in a separate change.

## Current product areas

- Landing page and Pulse Commerce architecture preview
- Workspace dashboard and architecture canvas (React Flow)
- Component library and inspector
- Node-attached queries and discussions
- Deterministic, graph-based failure simulations
- Timeline and local Zustand state

The current app uses local demo state. Real cloud persistence and live multiplayer collaboration are future backend/collaboration work; the visual presence shown in the prototype should not be treated as a real-time network session.
