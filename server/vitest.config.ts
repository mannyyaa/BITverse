import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    // Run tests sequentially so the single SQLite file isn't hit concurrently
    pool: "forks",
    poolOptions: { forks: { singleFork: true } },
    setupFiles: ["./src/__tests__/setup.ts"],
  },
});
