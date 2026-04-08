"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

export async function getPlatformsWithStatus() {
    await startup();
    const result = await pool.query(`
    SELECT id, name, enabled FROM platform ORDER BY name
  `);
    return result.rows as { id: number; name: string; enabled: boolean }[];
}

export async function getFormatsWithStatus() {
    await startup();
    const result = await pool.query(`
    SELECT id, name, enabled FROM format ORDER BY name
  `);
    return result.rows as { id: number; name: string; enabled: boolean }[];
}

export async function togglePlatform(id: number, enabled: boolean) {
    await startup();
    await pool.query(
        `UPDATE platform SET enabled = $1 WHERE id = $2`,
        [enabled, id]
    );
}

export async function toggleFormat(id: number, enabled: boolean) {
    await startup();
    await pool.query(
        `UPDATE format SET enabled = $1 WHERE id = $2`,
        [enabled, id]
    );
}