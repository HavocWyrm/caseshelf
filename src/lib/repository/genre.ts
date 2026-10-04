import "server-only";
import { PoolClient } from "pg";
import pool, { Queryable, withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { GenreSelection, ItemGenre } from "@/types/item";

export async function attachGenres<T extends { id: number }>(items: T[]): Promise<(T & { genres: ItemGenre[] })[]> {
    await startup();
    const result = await pool.query(
        `SELECT itemGenre.collection_item_id, genre.id::int AS id, genre.name, itemGenre.is_primary
     FROM item_genre itemGenre
     INNER JOIN genre ON genre.id = itemGenre.genre_id
     WHERE itemGenre.collection_item_id = ANY($1::bigint[])
     ORDER BY itemGenre.is_primary DESC, genre.name`,
        [items.map((item) => item.id)]
    );
    const byItem = new Map<number, ItemGenre[]>();
    for (const row of result.rows) {
        const itemId = Number(row.collection_item_id);
        const genres = byItem.get(itemId) ?? [];
        genres.push({ id: row.id, name: row.name, is_primary: row.is_primary });
        byItem.set(itemId, genres);
    }
    return items.map((item) => ({ ...item, genres: byItem.get(Number(item.id)) ?? [] }));
}

export async function getItemGenreSelection(collectionItemId: number, db: Queryable = pool): Promise<GenreSelection> {
    await startup();
    const result = await db.query(
        `SELECT genre_id::int AS genre_id, is_primary FROM item_genre WHERE collection_item_id = $1`,
        [collectionItemId]
    );
    return {
        ids: result.rows.map((row) => row.genre_id),
        primaryId: result.rows.find((row) => row.is_primary)?.genre_id ?? null,
    };
}

export async function setItemGenres(collectionItemId: number, selection: GenreSelection, client?: PoolClient) {
    await startup();
    if (client) return writeItemGenres(client, collectionItemId, selection);
    await withTransaction((transaction) => writeItemGenres(transaction, collectionItemId, selection));
}

async function writeItemGenres(client: PoolClient, collectionItemId: number, selection: GenreSelection) {
    const valid = await client.query(
        `SELECT genre.id::int AS id
     FROM genre
     INNER JOIN collection_item ON collection_item.type = genre.media_type
     WHERE collection_item.id = $1 AND genre.id = ANY($2::bigint[])`,
        [collectionItemId, selection.ids]
    );
    const validIds = new Set<number>(valid.rows.map((row) => row.id));
    const ids = [...new Set(selection.ids.map(Number))].filter((id) => validIds.has(id));

    const current = await client.query(
        `SELECT genre_id::int AS genre_id FROM item_genre WHERE collection_item_id = $1 AND is_primary`,
        [collectionItemId]
    );
    const currentPrimary: number | null = current.rows[0]?.genre_id ?? null;

    await client.query(
        `DELETE FROM item_genre WHERE collection_item_id = $1 AND NOT (genre_id = ANY($2::bigint[]))`,
        [collectionItemId, ids]
    );
    await client.query(
        `UPDATE item_genre SET is_primary = false WHERE collection_item_id = $1`,
        [collectionItemId]
    );
    await client.query(
        `INSERT INTO item_genre (collection_item_id, genre_id)
     SELECT $1, genre_id FROM unnest($2::bigint[]) AS genre_id
     ON CONFLICT (collection_item_id, genre_id) DO NOTHING`,
        [collectionItemId, ids]
    );

    const requested = selection.primaryId === null ? null : Number(selection.primaryId);
    const primaryId =
        requested !== null && ids.includes(requested) ? requested
            : currentPrimary !== null && ids.includes(currentPrimary) ? currentPrimary
                : ids[0] ?? null;
    if (primaryId !== null) {
        await client.query(
            `UPDATE item_genre SET is_primary = true WHERE collection_item_id = $1 AND genre_id = $2`,
            [collectionItemId, primaryId]
        );
    }
}
