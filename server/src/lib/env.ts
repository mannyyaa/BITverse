import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL:  z.string().min(1),
  JWT_SECRET:    z.string().min(32, "JWT_SECRET must be at least 32 characters"),
  JWT_EXPIRES_IN: z.string().default("7d"),
  PORT:          z.coerce.number().default(3001),
  NODE_ENV:      z.enum(["development", "test", "production"]).default("development"),
  CORS_ORIGINS:  z.string().default("http://localhost:5173"),
  WS_PORT:       z.coerce.number().default(3002),
});

function loadEnv() {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error("❌  Invalid environment variables:");
    result.error.issues.forEach((i) => console.error(`   ${i.path.join(".")}: ${i.message}`));
    process.exit(1);
  }
  return result.data;
}

export const env = loadEnv();
export type Env = typeof env;
