"use server";
import pool, { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameDetail, GameDetailsInput } from "@/types/item";
import { attachGenres } from "@/lib/repository/genre";
import { changedLockableFields, mergeLocks } from "@/lib/helpers/lockableField";
import { readCommonDetails, storedCommonLocks, submittedCommonLocks, textOrNull, writeCommonDetails } from "@/lib/itemDetails";

export async function getGameById(id: number): Promise<GameDetail | null> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      collectionItem.release_year,
      game.platform_id,
      platform.name AS platform_name,
      platform.short_name AS platform_short_name,
      platform.igdb_platform_id AS platform_igdb_id,
      genre.name AS primary_genre_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url,
      collectionItem.synopsis,
      collectionItem.provider,
      collectionItem.provider_id,
      collectionItem.metadata_fetched_at,
      collectionItem.locked_field,
      game.developer,
      game.publisher
    FROM collection_item collectionItem
    INNER JOIN game ON game.collection_item_id = collectionItem.id
    INNER JOIN platform ON platform.id = game.platform_id
    LEFT JOIN item_genre itemGenre ON itemGenre.collection_item_id = collectionItem.id AND itemGenre.is_primary
    LEFT JOIN genre ON genre.id = itemGenre.genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    WHERE collectionItem.id = $1
  `, [id]);

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    const [item] = await attachGenres([{
        id: row.id,
        title: row.title,
        type: "game" as const,
        owned: row.owned,
        release_year: row.release_year ?? null,
        platform_id: row.platform_id,
        platform_name: row.platform_name,
        platform_short_name: row.platform_short_name,
        platform_igdb_id: row.platform_igdb_id ?? null,
        primary_genre_name: row.primary_genre_name ?? null,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
        synopsis: row.synopsis ?? null,
        provider: row.provider ?? null,
        provider_id: row.provider_id ?? null,
        metadata_fetched_at: row.metadata_fetched_at ? new Date(row.metadata_fetched_at).toISOString() : null,
        locked_field: row.locked_field ?? [],
        developer: row.developer ?? null,
        publisher: row.publisher ?? null,
    }]);
    return item;
}

export async function updateGameDetails(id: number, input: GameDetailsInput) {
    await startup();
    await withTransaction(async (client) => {
        const stored = await readCommonDetails(client, id);
        const result = await client.query(
            `SELECT developer, publisher FROM game WHERE collection_item_id = $1`,
            [id]
        );
        const row = result.rows[0];
        const changed = changedLockableFields("game", {
            ...storedCommonLocks(stored),
            developer: row.developer,
            publisher: row.publisher,
        }, {
            ...submittedCommonLocks(input),
            developer: input.developer,
            publisher: input.publisher,
        });

        await writeCommonDetails(client, id, input, mergeLocks(stored.locked_field, changed));
        await client.query(
            `UPDATE game SET platform_id = $1, developer = $2, publisher = $3 WHERE collection_item_id = $4`,
            [input.platformId, textOrNull(input.developer), textOrNull(input.publisher), id]
        );
    });
}
