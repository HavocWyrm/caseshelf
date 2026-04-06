"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

export async function createGame(
    title: string,
    owned: boolean,
    platformId: number
) {
    await startup();
    const itemResult = await pool.query(
        `INSERT INTO collection_item (title, type, owned)
     VALUES ($1, 'game', $2)
     RETURNING id`,
        [title, owned]
    );
    await pool.query(
        `INSERT INTO game (collection_item_id, platform_id)
     VALUES ($1, $2)`,
        [itemResult.rows[0].id, platformId]
    );
}

export async function updateGame(
    id: number,
    title: string,
    owned: boolean,
    platformId: number
) {
    await startup();
    await pool.query(
        `UPDATE collection_item SET title = $1, owned = $2 WHERE id = $3`,
        [title, owned, id]
    );
    await pool.query(
        `UPDATE game SET platform_id = $1 WHERE collection_item_id = $2`,
        [platformId, id]
    );
}