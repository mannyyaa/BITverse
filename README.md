# BITverse
Build It Together — A collaborative multiplayer sandbox for designing, discussing, and stress-testing software architectures.

## Quickstart

```bash
npm install      # install dependencies (React + Vite + TS only, for now)
npm run dev      # start dev server at http://localhost:5173
npm run build    # typecheck + production build
npm run typecheck
```

## Project structure

Feature-sliced layout. `src/domain/` is the shared contract; `src/engine/` is
pure, React-free logic; `src/store/` and `src/collaboration/` are seams for
future real-time multiplayer (local Zustand today, Yjs-backed later).

```
src/
├── app/            shell, routing, providers
├── features/       vertical product slices (canvas, queries, failureLab, timeline, landing)
├── engine/         pure simulation + graph logic (no React)
├── store/          state layer — collaboration seam (Zustand, later Yjs)
├── collaboration/  future real-time layer (Yjs) — seam only
├── domain/         shared types — single source of truth
├── lib/            generic utils
└── styles/         global CSS
```

Build phases: (1) foundation [done] → (2) canvas core → (3) queries →
(4) failure lab → (5) timeline → (6) landing → (7) real-time collab → (8) polish.

