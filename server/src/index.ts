import "dotenv/config";   // must be first so env vars are available
import * as http from "http";
import { createApp }      from "./app.js";
import { createCollabServer } from "./collab/wsServer.js";
import { env }            from "./lib/env.js";
import { prisma }         from "./lib/prisma.js";

async function main() {
  // Verify DB is reachable on startup
  try {
    await prisma.$connect();
    console.log("[db] Connected");
  } catch (err) {
    console.error("[db] Could not connect:", err);
    process.exit(1);
  }

  const app        = createApp();
  const httpServer = http.createServer(app);

  // Attach Yjs WebSocket server to the same HTTP server (no extra port needed)
  createCollabServer(httpServer);

  httpServer.listen(env.PORT, () => {
    console.log(`[server] HTTP + WS listening on http://localhost:${env.PORT}`);
    console.log(`[server] Environment: ${env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log("\n[server] Shutting down…");
    httpServer.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };
  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
}

main();
