"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { MovieItem } from "@/types/item";

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

export async function getMovies(): Promise<MovieItem[]> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      movie.format_id,
      format.name AS format_name
    FROM collection_item collectionItem
    INNER JOIN movie ON movie.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = movie.format_id
    ORDER BY collectionItem.title
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "movie" as const,
        owned: row.owned,
        format_id: row.format_id,
        format_name: row.format_name,
    }));
}