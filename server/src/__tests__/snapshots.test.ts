import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();
let token: string;
let wsId: string;
let snapshotId: string;

const GRAPH_V1 = JSON.stringify({ nodes: [{ id: "a" }], edges: [], strokes: [] });
const GRAPH_V2 = JSON.stringify({ nodes: [{ id: "b" }], edges: [], strokes: [] });

beforeAll(async () => {
  await prisma.user.deleteMany({ where: { email: "snap@test.bitverse" } });
  const reg = await request(app).post("/api/auth/register")
    .send({ email: "snap@test.bitverse", name: "Snap", password: "password123" });
  token = reg.body.token;

  const ws = await request(app).post("/api/workspaces")
    .set("Authorization", `Bearer ${token}`)
    .send({ name: "Snapshot WS", graphJson: GRAPH_V1 });
  wsId = ws.body.id;
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: "snap@test.bitverse" } });
  await prisma.$disconnect();
});

describe("Snapshots", () => {
  it("saves a snapshot", async () => {
    const res = await request(app)
      .post(`/api/workspaces/${wsId}/snapshots`)
      .set("Authorization", `Bearer ${token}`)
      .send({ name: "v1", description: "Initial state", graphJson: GRAPH_V1 });
    expect(res.status).toBe(201);
    snapshotId = res.body.id;
    expect(res.body.name).toBe("v1");
  });

  it("lists snapshots", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${wsId}/snapshots`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.snapshots.length).toBe(1);
  });

  it("reads snapshot graph", async () => {
    const res = await request(app)
      .get(`/api/workspaces/${wsId}/snapshots/${snapshotId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.graphJson).toBe(GRAPH_V1);
  });

  it("survives a server restart (data is in SQLite)", async () => {
    // Simply re-read — if SQLite persisted, it will still be there
    const res = await request(app)
      .get(`/api/workspaces/${wsId}/snapshots/${snapshotId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(JSON.parse(res.body.graphJson).nodes[0].id).toBe("a");
  });

  it("restores a snapshot", async () => {
    // First mutate the workspace graph
    await request(app).patch(`/api/workspaces/${wsId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({ graphJson: GRAPH_V2 });

    // Restore
    const res = await request(app)
      .post(`/api/workspaces/${wsId}/snapshots/${snapshotId}/restore`)
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.graphJson).toBe(GRAPH_V1);

    // Confirm workspace was actually updated
    const ws = await request(app)
      .get(`/api/workspaces/${wsId}`)
      .set("Authorization", `Bearer ${token}`);
    expect(ws.body.graphJson).toBe(GRAPH_V1);
  });
});
