import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { ApiError } from "../middleware/error.js";
import type { Request } from "express";
import type { Prisma } from "@prisma/client";

interface AuthReq extends Request { user: { sub: string; email: string; name: string } }

export const queriesRouter = Router({ mergeParams: true });
queriesRouter.use(requireAuth);

async function assertMember(workspaceId: string, userId: string) {
  const m = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!m) throw new ApiError(403, "Not a workspace member");
  return m;
}

const createQuerySchema = z.object({
  title:      z.string().min(1).max(200),
  body:       z.string().max(2000).default(""),
  type:       z.enum(["question", "issue", "improvement"]).default("question"),
  priority:   z.enum(["low", "medium", "high", "critical"]).default("medium"),
  targetKind: z.enum(["node", "edge"]).default("node"),
  targetId:   z.string().min(1),
  assigneeId: z.string().optional(),
});

// Full query include shape
const queryInclude = {
  author: { select: { id: true, name: true, avatarColor: true } },
  replies: {
    include: { author: { select: { id: true, name: true, avatarColor: true } } },
    orderBy: { createdAt: "asc" as const },
  },
} satisfies Prisma.QueryInclude;

type QueryWithRelations = Prisma.QueryGetPayload<{ include: typeof queryInclude }>;

function serializeQuery(q: QueryWithRelations) {
  return {
    id:         q.id,
    title:      q.title,
    body:       q.body,
    type:       q.type,
    status:     q.status,
    priority:   q.priority,
    targetKind: q.targetKind,
    targetId:   q.targetId,
    assigneeId: q.assigneeId,
    resolvedAt: q.resolvedAt,
    createdAt:  q.createdAt,
    author:     q.author,
    thread:     q.replies.map((r) => ({
      id: r.id, body: r.body, author: r.author, createdAt: r.createdAt,
    })),
  };
}

// GET /api/workspaces/:id/queries
queriesRouter.get("/", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const workspaceId = (req.params as { id: string }).id;
    await assertMember(workspaceId, userId);

    const queries = await prisma.query.findMany({
      where: { workspaceId },
      include: queryInclude,
      orderBy: { createdAt: "desc" },
    });
    res.json({ queries: queries.map(serializeQuery) });
  } catch (err) { next(err); }
});

// POST /api/workspaces/:id/queries
queriesRouter.post("/", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const workspaceId = (req.params as { id: string }).id;
    await assertMember(workspaceId, userId);

    const body = createQuerySchema.parse(req.body);
    const query = await prisma.query.create({
      data: { ...body, workspaceId, authorId: userId },
      include: queryInclude,
    });
    res.status(201).json(serializeQuery(query));
  } catch (err) { next(err); }
});

// PATCH /api/workspaces/:id/queries/:queryId
queriesRouter.patch("/:queryId", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const params = req.params as { id: string; queryId: string };
    await assertMember(params.id, userId);

    const body = z.object({
      status:     z.enum(["open", "in-discussion", "resolved"]).optional(),
      assigneeId: z.string().nullable().optional(),
    }).parse(req.body);

    const query = await prisma.query.update({
      where: { id: params.queryId },
      data: {
        ...(body.status !== undefined && { status: body.status }),
        ...(body.assigneeId !== undefined && { assigneeId: body.assigneeId }),
        ...(body.status === "resolved" && { resolvedAt: new Date() }),
      },
      include: queryInclude,
    });
    res.json(serializeQuery(query));
  } catch (err) { next(err); }
});

// POST /api/workspaces/:id/queries/:queryId/replies
queriesRouter.post("/:queryId/replies", async (req, res, next) => {
  try {
    const userId = ((req as unknown) as AuthReq).user.sub;
    const params = req.params as { id: string; queryId: string };
    await assertMember(params.id, userId);

    const existing = await prisma.query.findFirst({ where: { id: params.queryId, workspaceId: params.id } });
    if (!existing) throw new ApiError(404, "Query not found");

    const { body: text } = z.object({ body: z.string().min(1).max(2000) }).parse(req.body);
    const reply = await prisma.queryReply.create({
      data: { queryId: params.queryId, authorId: userId, body: text },
      include: { author: { select: { id: true, name: true, avatarColor: true } } },
    });

    if (existing.status === "open") {
      await prisma.query.update({ where: { id: existing.id }, data: { status: "in-discussion" } });
    }

    res.status(201).json({ id: reply.id, body: reply.body, author: reply.author, createdAt: reply.createdAt });
  } catch (err) { next(err); }
});
