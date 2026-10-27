import { Router } from "express";
import { z } from "zod";
import { prisma } from "../lib/prisma.js";
import { requireAuth, type AuthRequest } from "../middleware/auth.js";
import { ApiError } from "../middleware/error.js";

export const workspacesRouter = Router();
workspacesRouter.use(requireAuth);

const createSchema = z.object({
  name: z.string().min(1).max(120),
  description: z.string().max(300).default(""),
  graphJson: z.string().optional(),
});

const updateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  description: z.string().max(300).optional(),
  graphJson: z.string().optional(),
  scenariosJson: z.string().optional(),
  timelineJson: z.string().optional(),
  mode: z.enum(["brainstorm", "architecture"]).optional(),
});

// Verify the requesting user is a member of the workspace (returns the member record)
async function assertMember(workspaceId: string, userId: string, minRole?: "owner") {
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId, userId } },
  });
  if (!member) throw new ApiError(403, "You are not a member of this workspace");
  if (minRole === "owner" && member.role !== "owner")
    throw new ApiError(403, "Only the workspace owner can perform this action");
  return member;
}

// GET /api/workspaces — list workspaces for the current user
workspacesRouter.get("/", async (req, res, next) => {
  try {
    const { sub } = ((req as unknown) as AuthRequest).user;
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId: sub },
      include: { workspace: true },
      orderBy: { workspace: { updatedAt: "desc" } },
    });
    const workspaces = memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      description: m.workspace.description,
      mode: m.workspace.mode,
      role: m.role,
      createdAt: m.workspace.createdAt,
      updatedAt: m.workspace.updatedAt,
    }));
    res.json({ workspaces });
  } catch (err) {
    next(err);
  }
});

// POST /api/workspaces — create a new workspace
workspacesRouter.post("/", async (req, res, next) => {
  try {
    const { sub } = ((req as unknown) as AuthRequest).user;
    const body = createSchema.parse(req.body);

    const workspace = await prisma.workspace.create({
      data: {
        name: body.name,
        description: body.description,
        graphJson: body.graphJson ?? JSON.stringify({ nodes: [], edges: [], strokes: [] }),
        members: { create: { userId: sub, role: "owner" } },
      },
    });

    res.status(201).json(serializeWorkspace(workspace));
  } catch (err) {
    next(err);
  }
});

// GET /api/workspaces/:id — read a workspace
workspacesRouter.get("/:id", async (req, res, next) => {
  try {
    const { sub } = ((req as unknown) as AuthRequest).user;
    const { id } = req.params;
    await assertMember(id, sub);

    const workspace = await prisma.workspace.findUnique({ where: { id } });
    if (!workspace) throw new ApiError(404, "Workspace not found");

    // Also return member list
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId: id },
      include: { user: { select: { id: true, name: true, email: true, avatarColor: true } } },
    });

    res.json({
      ...serializeWorkspace(workspace),
      members: members.map((m) => ({
        userId: m.userId,
        name: m.user.name,
        email: m.user.email,
        avatarColor: m.user.avatarColor,
        role: m.role,
      })),
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/workspaces/:id — update workspace
workspacesRouter.patch("/:id", async (req, res, next) => {
  try {
    const { sub } = ((req as unknown) as AuthRequest).user;
    const { id } = req.params;
    await assertMember(id, sub);

    const body = updateSchema.parse(req.body);
    const workspace = await prisma.workspace.update({
      where: { id },
      data: {
        ...(body.name !== undefined && { name: body.name }),
        ...(body.description !== undefined && { description: body.description }),
        ...(body.graphJson !== undefined && { graphJson: body.graphJson }),
        ...(body.scenariosJson !== undefined && { scenariosJson: body.scenariosJson }),
        ...(body.timelineJson !== undefined && { timelineJson: body.timelineJson }),
        ...(body.mode !== undefined && { mode: body.mode }),
      },
    });
    res.json(serializeWorkspace(workspace));
  } catch (err) {
    next(err);
  }
});

// DELETE /api/workspaces/:id — delete (owner only)
workspacesRouter.delete("/:id", async (req, res, next) => {
  try {
    const { sub } = ((req as unknown) as AuthRequest).user;
    const { id } = req.params;
    await assertMember(id, sub, "owner");

    await prisma.workspace.delete({ where: { id } });
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

// POST /api/workspaces/:id/members — invite a member
workspacesRouter.post("/:id/members", async (req, res, next) => {
  try {
    const { sub } = ((req as unknown) as AuthRequest).user;
    const { id } = req.params;
    await assertMember(id, sub, "owner");

    const { email, role } = z.object({
      email: z.string().email(),
      role: z.enum(["editor", "viewer"]).default("editor"),
    }).parse(req.body);

    const invitee = await prisma.user.findUnique({ where: { email } });
    if (!invitee) throw new ApiError(404, "No user with that email found");

    const existing = await prisma.workspaceMember.findUnique({
      where: { workspaceId_userId: { workspaceId: id, userId: invitee.id } },
    });
    if (existing) throw new ApiError(409, "User is already a member");

    const member = await prisma.workspaceMember.create({
      data: { workspaceId: id, userId: invitee.id, role },
    });
    res.status(201).json({ userId: member.userId, role: member.role });
  } catch (err) {
    next(err);
  }
});

function serializeWorkspace(workspace: {
  id: string; name: string; description: string;
  graphJson: string; scenariosJson: string; timelineJson: string;
  mode: string; createdAt: Date; updatedAt: Date;
}) {
  return {
    id: workspace.id,
    name: workspace.name,
    description: workspace.description,
    graphJson: workspace.graphJson,
    scenariosJson: workspace.scenariosJson,
    timelineJson: workspace.timelineJson,
    mode: workspace.mode,
    createdAt: workspace.createdAt,
    updatedAt: workspace.updatedAt,
  };
}
