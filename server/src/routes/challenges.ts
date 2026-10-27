import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/error.js";
import type { Request } from "express";

interface AuthReq extends Request { user: { sub: string; email: string; name: string } }

export const challengesRouter = Router({ mergeParams: true });
challengesRouter.use(requireAuth);

async function assertMember(workspaceId: string, userId: string) {
  const m = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!m) throw new ApiError(403, "Not a workspace member");
  return m;
}

// POST /api/workspaces/:id/challenges
challengesRouter.post("/", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const workspaceId = (req.params as { id: string }).id;
    await assertMember(workspaceId, userId);

    const body = z.object({
      scenarioId:    z.string().min(1),
      scenarioName:  z.string().min(1).max(120),
      affectedNodes: z.array(z.string()).default([]),
      outcome:       z.enum(["ran", "improved"]).default("ran"),
      impactScore:   z.number().min(0).max(1).default(0),
    }).parse(req.body);

    const record = await prisma.challengeRecord.create({
      data: {
        workspaceId,
        scenarioId:    body.scenarioId,
        scenarioName:  body.scenarioName,
        affectedNodes: JSON.stringify(body.affectedNodes),
        outcome:       body.outcome,
        impactScore:   body.impactScore,
      },
    });

    res.status(201).json({ id: record.id, scenarioId: record.scenarioId, scenarioName: record.scenarioName, outcome: record.outcome, impactScore: record.impactScore, createdAt: record.createdAt });
  } catch (err) { next(err); }
});

// GET /api/workspaces/:id/challenges
challengesRouter.get("/", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const workspaceId = (req.params as { id: string }).id;
    await assertMember(workspaceId, userId);

    const records = await prisma.challengeRecord.findMany({
      where: { workspaceId },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    res.json({
      records: records.map((r) => ({ id: r.id, scenarioId: r.scenarioId, scenarioName: r.scenarioName, outcome: r.outcome, impactScore: r.impactScore, createdAt: r.createdAt })),
    });
  } catch (err) { next(err); }
});
