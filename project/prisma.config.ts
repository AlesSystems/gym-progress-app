import { defineConfig } from "prisma/config";
import { config } from "dotenv";

config({ path: ".env" });

// Migrations must use the direct connection (port 5432 Session Mode), not the pooler (port 6543).
const rawConnectionString = process.env["DATABASE_URL"] ?? "";
const rawDirectUrl = process.env["DIRECT_URL"] ?? rawConnectionString;

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: rawDirectUrl,
  },
});
