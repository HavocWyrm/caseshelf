"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

export async function createMovie(
    title: string,
    owned: boolean,
    formatId: number
) {
    await startup();
    const itemResult = await pool.query(
        `INSERT INTO collection_item (title, type, owned)
     VALUES ($1, 'movie', $2)
     RETURNING id`,
        [title, owned]
    );
    await pool.query(
        `INSERT INTO movie (collection_item_id, format_id)
     VALUES ($1, $2)`,
        [itemResult.rows[0].id, formatId]
    );
}

export async function updateMovie(
    id: number,
    title: string,
    owned: boolean,
    formatId: number
) {
    await startup();
    await pool.query(
        `UPDATE collection_item SET title = $1, owned = $2 WHERE id = $3`,
        [title, owned, id]
    );
    await pool.query(
        `UPDATE movie SET format_id = $1 WHERE collection_item_id = $2`,
        [formatId, id]
    );
}