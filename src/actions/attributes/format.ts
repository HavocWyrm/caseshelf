"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { Format } from "@/types/item";

export async function getFormats(): Promise<Format[]> {
  await startup();
  const result = await pool.query(`
    SELECT id, name FROM format WHERE enabled = true ORDER BY name
  `);
  return result.rows;
}