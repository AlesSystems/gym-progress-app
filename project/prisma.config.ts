import { defineConfig } from "prisma/config";
import { config } from "dotenv";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";

config({ path: ".env" });

const rawConnectionString = process.env["DATABASE_URL"] ?? "";
const dbUrl = new URL(rawConnectionString);
dbUrl.searchParams.delete("sslmode");
const connectionString = dbUrl.toString();

// Migrations must use the direct connection (port 5432 Session Mode), not the pooler (port 6543).
// The schema engine needs sslmode in the URL itself (it doesn't use the Node.js Pool ssl option),
// so we keep sslmode=require in directConnectionString but strip it from the pooler URL.
const rawDirectUrl = process.env["DIRECT_URL"] ?? rawConnectionString;
const directConnectionString = rawDirectUrl;

const pool = new Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});

const adapter = new PrismaPg(pool);

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "ts-node prisma/seed.ts",
  },
  datasource: {
    url: directConnectionString,
    adapter,
  },
});
