import { readFileSync, readdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import pg from "pg";
import dotenv from "dotenv";

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, "../.env") });

const { Pool } = pg;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

// Switch from transaction pooler (6543) to session pooler (5432) for DDL support
// Strip sslmode param — we pass ssl options directly
const sessionUrl = connectionString
  .replace(/:6543\//, ":5432/")
  .replace(/[?&]sslmode=[^&]*/g, "")
  .replace(/[?&]$/, "");

console.log("Connecting via session pooler:", sessionUrl.replace(/:([^:@]+)@/, ":***@"));

const pool = new Pool({
  connectionString: sessionUrl,
  ssl: { rejectUnauthorized: false },
});

const migrationsDir = join(__dirname, "../prisma/migrations");

async function run() {
  const client = await pool.connect();
  console.log("Connected to database.");

  try {
    // Create the Prisma migrations tracking table if it doesn't exist
    await client.query(`
      CREATE TABLE IF NOT EXISTS "_prisma_migrations" (
        id VARCHAR(36) NOT NULL,
        checksum VARCHAR(64) NOT NULL,
        finished_at TIMESTAMPTZ,
        migration_name VARCHAR(255) NOT NULL,
        logs TEXT,
        rolled_back_at TIMESTAMPTZ,
        started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
        applied_steps_count INT NOT NULL DEFAULT 0,
        CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY (id)
      );
    `);

    // Get already-applied migrations
    const { rows: applied } = await client.query(
      `SELECT migration_name FROM "_prisma_migrations" WHERE finished_at IS NOT NULL`
    );
    const appliedNames = new Set(applied.map((r) => r.migration_name));

    // Read and sort migration folders
    const folders = readdirSync(migrationsDir)
      .filter((f) => !f.endsWith(".toml"))
      .sort();

    for (const folder of folders) {
      if (appliedNames.has(folder)) {
        console.log(`⏭  Skipping (already applied): ${folder}`);
        continue;
      }

      const sqlPath = join(migrationsDir, folder, "migration.sql");
      const sql = readFileSync(sqlPath, "utf8");

      console.log(`▶  Applying: ${folder}`);
      const id = crypto.randomUUID();
      await client.query(
        `INSERT INTO "_prisma_migrations" (id, checksum, migration_name, started_at, applied_steps_count)
         VALUES ($1, 'manual', $2, now(), 0)`,
        [id, folder]
      );

      await client.query(sql);

      await client.query(
        `UPDATE "_prisma_migrations" SET finished_at = now(), applied_steps_count = 1 WHERE id = $1`,
        [id]
      );
      console.log(`✓  Done: ${folder}`);
    }

    console.log("\nAll migrations applied successfully!");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
