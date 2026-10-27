import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/error.js";
import type { Request } from "express";

interface AuthReq extends Request { user: { sub: string; email: string; name: string } }

export const snapshotsRouter = Router({ mergeParams: true });
snapshotsRouter.use(requireAuth);

async function assertMember(workspaceId: string, userId: string) {
  const m = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!m) throw new ApiError(403, "Not a workspace member");
  return m;
}

// GET /api/workspaces/:id/snapshots
snapshotsRouter.get("/", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const workspaceId = (req.params as { id: string }).id;
    await assertMember(workspaceId, userId);

    const snapshots = await prisma.snapshot.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, description: true, createdAt: true },
    });
    res.json({ snapshots });
  } catch (err) { next(err); }
});

// POST /api/workspaces/:id/snapshots
snapshotsRouter.post("/", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const workspaceId = (req.params as { id: string }).id;
    await assertMember(workspaceId, userId);

    const body = z.object({
      name: z.string().min(1).max(120),
      description: z.string().max(300).default(""),
      graphJson: z.string(),
      yjsState: z.string().optional(),
    }).parse(req.body);

    const snapshot = await prisma.snapshot.create({
      data: { workspaceId, name: body.name, description: body.description, graphJson: body.graphJson, yjsState: body.yjsState },
    });
    res.status(201).json({ id: snapshot.id, name: snapshot.name, description: snapshot.description, createdAt: snapshot.createdAt });
  } catch (err) { next(err); }
});

// GET /api/workspaces/:id/snapshots/:snapshotId
snapshotsRouter.get("/:snapshotId", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const params = req.params as { id: string; snapshotId: string };
    await assertMember(params.id, userId);

    const snapshot = await prisma.snapshot.findFirst({ where: { id: params.snapshotId, workspaceId: params.id } });
    if (!snapshot) throw new ApiError(404, "Snapshot not found");
    res.json({ id: snapshot.id, name: snapshot.name, description: snapshot.description, graphJson: snapshot.graphJson, yjsState: snapshot.yjsState, createdAt: snapshot.createdAt });
  } catch (err) { next(err); }
});

// POST /api/workspaces/:id/snapshots/:snapshotId/restore
snapshotsRouter.post("/:snapshotId/restore", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const params = req.params as { id: string; snapshotId: string };
    await assertMember(params.id, userId);

    const snapshot = await prisma.snapshot.findFirst({ where: { id: params.snapshotId, workspaceId: params.id } });
    if (!snapshot) throw new ApiError(404, "Snapshot not found");

    const updated = await prisma.workspace.update({ where: { id: params.id }, data: { graphJson: snapshot.graphJson } });
    res.json({ ok: true, graphJson: updated.graphJson });
  } catch (err) { next(err); }
});
