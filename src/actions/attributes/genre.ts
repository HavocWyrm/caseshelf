"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { Genre, ItemType } from "@/types/item";

export async function getGenres(mediaType: ItemType): Promise<Genre[]> {
    await startup();
    const result = await pool.query(
        `SELECT id::int AS id, name FROM genre WHERE media_type = $1 ORDER BY name`,
        [mediaType]
    );
    return result.rows;
}
