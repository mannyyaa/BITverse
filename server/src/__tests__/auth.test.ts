/**
 * Auth route tests — use a real SQLite test database so nothing is mocked.
 */
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { createApp } from "../app.js";
import { prisma } from "../lib/prisma.js";

const app = createApp();

beforeAll(async () => {
  // Clean up any leftover test users
  await prisma.user.deleteMany({ where: { email: { endsWith: "@test.bitverse" } } });
});

afterAll(async () => {
  await prisma.user.deleteMany({ where: { email: { endsWith: "@test.bitverse" } } });
  await prisma.$disconnect();
});

describe("POST /api/auth/register", () => {
  it("creates a user and returns a JWT", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "alice@test.bitverse", name: "Alice", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.token).toBeTruthy();
    expect(res.body.user.email).toBe("alice@test.bitverse");
  });

  it("rejects duplicate email with 409", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "alice@test.bitverse", name: "Alice2", password: "password123" });
    expect(res.status).toBe(409);
  });

  it("rejects weak password with 422", async () => {
    const res = await request(app)
      .post("/api/auth/register")
      .send({ email: "bob@test.bitverse", name: "Bob", password: "short" });
    expect(res.status).toBe(422);
  });
});

describe("POST /api/auth/login", () => {
  it("returns token for valid credentials", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.bitverse", password: "password123" });
    expect(res.status).toBe(200);
    expect(res.body.token).toBeTruthy();
  });

  it("rejects wrong password with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.bitverse", password: "wrongpassword" });
    expect(res.status).toBe(401);
  });

  it("rejects unknown email with 401", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@test.bitverse", password: "password123" });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/auth/me", () => {
  let token: string;

  beforeAll(async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "alice@test.bitverse", password: "password123" });
    token = res.body.token;
  });

  it("returns current user", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.email).toBe("alice@test.bitverse");
  });

  it("rejects missing token with 401", async () => {
    const res = await request(app).get("/api/auth/me");
    expect(res.status).toBe(401);
  });

  it("rejects tampered token with 401", async () => {
    const res = await request(app)
      .get("/api/auth/me")
      .set("Authorization", "Bearer tampered.token.here");
    expect(res.status).toBe(401);
  });
});
