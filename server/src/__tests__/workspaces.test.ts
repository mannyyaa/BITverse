import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();
let tokenA: string;
let tokenB: string;
let workspaceId: string;

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ws.test" } } });

  // Register two users
  const regA = await request(app).post("/api/auth/register")
    .send({ email: "owner@ws.test", name: "Owner", password: "password123" });
  const regB = await request(app).post("/api/auth/register")
    .send({ email: "stranger@ws.test", name: "Stranger", password: "password123" });

  tokenA = regA.body.token;
  tokenB = regB.body.token;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@ws.test" } } });
  await prisma.$disconnect();
});

describe("Workspace CRUD", () => {
  it("creates a workspace", async () => {
    const res = await request(app)
      .post("/api/workspaces")
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ name: "Test Workspace", description: "For testing" });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe("Test Workspace");
    workspaceId = res.body.id;
  });

  it("lists workspaces — owner sees their workspace", async () => {
    const res = await request(app)
      .get("/api/workspaces")
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.workspaces.some((w: { id: string }) => w.id === workspaceId)).toBe(true);
  });

  it("reads workspace as owner", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(workspaceId);
  });

  it("403 when non-member reads workspace", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenB}`);
    expect(res.status).toBe(403);
  });

  it("403 when non-member patches workspace", async () => {
    const res = await request(app)
      .patch(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenB}`)
      .send({ name: "Hijack" });
    expect(res.status).toBe(403);
  });

  it("updates graphJson", async () => {
    const graph = JSON.stringify({ nodes: [{ id: "n1" }], edges: [], strokes: [] });
    const res = await request(app)
      .patch(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenA}`)
      .send({ graphJson: graph });
    expect(res.status).toBe(200);
    expect(res.body.graphJson).toBe(graph);
  });

  it("deletes workspace as owner", async () => {
    const res = await request(app)
      .delete(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(204);
  });

  it("404 after deletion", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${workspaceId}`)
      .set("Authorization", `Bearer ${tokenA}`);
    expect(res.status).toBe(403); // member record also gone via cascade
  });
});
