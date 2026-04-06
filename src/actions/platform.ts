"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { Platform } from "@/types/item";

export async function getPlatforms(): Promise<Platform[]> {
    await startup();
    const result = await pool.query(`
    SELECT id, name FROM platform ORDER BY name
  `);
    return result.rows;
}