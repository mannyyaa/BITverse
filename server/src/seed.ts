/**
 * Development seed — creates two users and a shared workspace.
 * Run:  npm run db:seed  (from server/)
 *
 * Demo credentials:
 *   aanya@bitverse.dev / password123
 *   rohan@bitverse.dev / password123
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "./lib/prisma.js";

const DEMO_GRAPH = JSON.stringify({
  nodes: [
    { id: "web-client",  type: "architecture", kind: "web-client",    label: "Web Client",     status: "healthy", position: { x: 60,  y: 200 } },
    { id: "api-gateway", type: "architecture", kind: "api-gateway",   label: "API Gateway",    status: "healthy", position: { x: 300, y: 200 } },
    { id: "svc-product", type: "architecture", kind: "service",       label: "Product Service",status: "healthy", position: { x: 540, y: 120 } },
    { id: "svc-order",   type: "architecture", kind: "service",       label: "Order Service",  status: "healthy", position: { x: 540, y: 250 } },
    { id: "postgres-db", type: "architecture", kind: "database",      label: "PostgreSQL",     status: "healthy", position: { x: 780, y: 200 } },
    { id: "redis-cache", type: "architecture", kind: "cache",         label: "Redis Cache",    status: "healthy", position: { x: 780, y: 80  } },
  ],
  edges: [
    { id: "e1", source: "web-client",  target: "api-gateway",  kind: "dataflow", animated: true },
    { id: "e2", source: "api-gateway", target: "svc-product",  kind: "dataflow", animated: true },
    { id: "e3", source: "api-gateway", target: "svc-order",    kind: "dataflow", animated: true },
    { id: "e4", source: "svc-product", target: "redis-cache",  kind: "dataflow", animated: true },
    { id: "e5", source: "svc-product", target: "postgres-db",  kind: "dataflow", animated: true },
    { id: "e6", source: "svc-order",   target: "postgres-db",  kind: "dataflow", animated: true },
  ],
  strokes: [],
});

async function seed() {
  console.log("Seeding development database…");

  const hash = await bcrypt.hash("password123", 12);

  const aanya = await prisma.user.upsert({
    where:  { email: "aanya@bitverse.dev" },
    update: {},
    create: { email: "aanya@bitverse.dev", name: "Aanya", passwordHash: hash, avatarColor: "#6c5ce7" },
  });

  const rohan = await prisma.user.upsert({
    where:  { email: "rohan@bitverse.dev" },
    update: {},
    create: { email: "rohan@bitverse.dev", name: "Rohan", passwordHash: hash, avatarColor: "#00b894" },
  });

  // Create shared workspace
  const existing = await prisma.workspace.findFirst({ where: { name: "Pulse Commerce" } });
  if (!existing) {
    const ws = await prisma.workspace.create({
      data: {
        name: "Pulse Commerce",
        description: "E-commerce Architecture",
        graphJson: DEMO_GRAPH,
        members: {
          create: [
            { userId: aanya.id, role: "owner" },
            { userId: rohan.id, role: "editor" },
          ],
        },
      },
    });

    // Seed one query
    await prisma.query.create({
      data: {
        workspaceId: ws.id,
        authorId:    aanya.id,
        title:       "Is the primary database a single point of failure?",
        body:        "We have three services depending on the same PostgreSQL instance. If it goes down, the entire checkout flow stops.",
        type:        "issue",
        status:      "open",
        priority:    "critical",
        targetKind:  "node",
        targetId:    "postgres-db",
      },
    });

    console.log(`✅  Created workspace: ${ws.id}`);
  } else {
    console.log("Workspace already exists — skipping.");
  }

  console.log("Seed complete.");
  console.log("\nDemo credentials:");
  console.log("  aanya@bitverse.dev / password123");
  console.log("  rohan@bitverse.dev / password123");
}

seed()
  .catch((err) => { console.error(err); process.exit(1); })
  .finally(() => prisma.$disconnect());
