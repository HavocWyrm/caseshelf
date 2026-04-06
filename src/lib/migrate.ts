import pool from "./db";
import fs from "fs";
import path from "path";

export async function migrate() {
    await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id          SERIAL PRIMARY KEY,
      name        TEXT NOT NULL UNIQUE,
      applied_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

    const migrationsDir = path.join(process.cwd(), "src/lib/migrations");
    const files = fs.readdirSync(migrationsDir)
        .filter((f) => f.endsWith(".sql"))
        .sort();

    for (const file of files) {
        const { rows } = await pool.query(
            "SELECT id FROM migrations WHERE name = $1",
            [file]
        );

        if (rows.length > 0) continue;

        const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
        await pool.query(sql);
        await pool.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
        console.log(`Applied migration: ${file}`);
    }
}