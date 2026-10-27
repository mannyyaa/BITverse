/**
 * Global test setup — load the same .env the server uses so DATABASE_URL
 * and JWT_SECRET are available in the test process.
 */
import { config } from "dotenv";
import { resolve } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
config({ path: resolve(__dirname, "../../.env") });
