import express from "express";
import cors from "cors";
import helmet from "helmet";
import { env } from "./lib/env.js";
import { authRouter }       from "./routes/auth.js";
import { workspacesRouter } from "./routes/workspaces.js";
import { snapshotsRouter }  from "./routes/snapshots.js";
import { queriesRouter }    from "./routes/queries.js";
import { challengesRouter } from "./routes/challenges.js";
import { notFound, errorHandler } from "./middleware/error.js";

export function createApp() {
  const app = express();

  // ── Security ──────────────────────────────────────────────────────────────
  app.use(helmet());
  app.use(cors({
    origin: env.CORS_ORIGINS.split(",").map((o) => o.trim()),
    credentials: true,
  }));

  // ── Body parsing ──────────────────────────────────────────────────────────
  app.use(express.json({ limit: "4mb" }));   // graph JSON can be large

  // ── Health ────────────────────────────────────────────────────────────────
  app.get("/health", async (_req, res) => {
    try {
      // Verify DB connectivity with a cheap query
      const { prisma } = await import("./lib/prisma.js");
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: "ok", db: "ok" });
    } catch {
      res.status(503).json({ status: "error", db: "unreachable" });
    }
  });

  // ── Routes ────────────────────────────────────────────────────────────────
  app.use("/api/auth", authRouter);
  app.use("/api/workspaces", workspacesRouter);
  // Nested workspace sub-resources — mergeParams is set in each sub-router
  app.use("/api/workspaces/:id/snapshots",  snapshotsRouter);
  app.use("/api/workspaces/:id/queries",    queriesRouter);
  app.use("/api/workspaces/:id/challenges", challengesRouter);

  // ── Error handling ────────────────────────────────────────────────────────
  app.use(notFound);
  app.use(errorHandler);

  return app;
}
