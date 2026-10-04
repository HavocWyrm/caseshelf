import "server-only";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

const STALE_DAYS_KEY = "job_refresh_stale_days";
export const DEFAULT_STALE_DAYS = 30;
const MAX_STALE_DAYS = 3650;

export function validStaleDays(value: unknown): number | null {
    const days = Number(value);
    return Number.isInteger(days) && days >= 1 && days <= MAX_STALE_DAYS ? days : null;
}

export async function getStaleDays(): Promise<number> {
    await startup();
    const result = await pool.query(`SELECT value FROM setting WHERE key = $1`, [STALE_DAYS_KEY]);
    return validStaleDays(result.rows[0]?.value) ?? DEFAULT_STALE_DAYS;
}

export async function saveStaleDays(days: number) {
    await startup();
    await pool.query(
        `INSERT INTO setting (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key)
     DO UPDATE SET value = $2, updated_at = now()`,
        [STALE_DAYS_KEY, String(days)]
    );
}
