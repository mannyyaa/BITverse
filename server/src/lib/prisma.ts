import { PrismaClient } from "@prisma/client";
import { env } from "./env.js";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

// Reuse a single instance in development to avoid exhausting connections
// across hot-reload cycles; always create a fresh instance in production.
export const prisma: PrismaClient =
  env.NODE_ENV === "production"
    ? new PrismaClient()
    : (globalThis.__prisma ??= new PrismaClient({
        log: ["error", "warn"],
      }));
