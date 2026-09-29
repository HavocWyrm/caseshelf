"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameGenre, MediaGenre } from "@/types/item";

type SortableTable = "platform" | "format" | "game_genre" | "media_genre";

export async function getPlatformsWithStatus() {
    await startup();
    const result = await pool.query(`
    SELECT id, name, enabled FROM platform ORDER BY sort_order NULLS LAST, name
  `);
    return result.rows as { id: number; name: string; enabled: boolean }[];
}

export async function getFormatsWithStatus() {
    await startup();
    const result = await pool.query(`
    SELECT id, name, enabled FROM format ORDER BY sort_order NULLS LAST, name
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

export async function getGameGenresByPriority(): Promise<GameGenre[]> {
    await startup();
    const result = await pool.query(`
    SELECT id, name FROM game_genre ORDER BY sort_order NULLS LAST, name
  `);
    return result.rows;
}

export async function getMediaGenresByPriority(): Promise<MediaGenre[]> {
    await startup();
    const result = await pool.query(`
    SELECT id, name FROM media_genre ORDER BY sort_order NULLS LAST, name
  `);
    return result.rows;
}

async function saveSortOrder(table: SortableTable, ids: number[]) {
    await startup();
    await pool.query(
        `UPDATE ${table} SET sort_order = ordered.position
         FROM unnest($1::bigint[]) WITH ORDINALITY AS ordered(id, position)
         WHERE ${table}.id = ordered.id`,
        [ids]
    );
}

export async function savePlatformOrder(ids: number[]) {
    await saveSortOrder("platform", ids);
}

export async function saveFormatOrder(ids: number[]) {
    await saveSortOrder("format", ids);
}

export async function saveGameGenreOrder(ids: number[]) {
    await saveSortOrder("game_genre", ids);
}

export async function saveMediaGenreOrder(ids: number[]) {
    await saveSortOrder("media_genre", ids);
}
