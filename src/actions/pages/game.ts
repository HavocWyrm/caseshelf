"use server";
import pool, { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { compareTitle } from "@/lib/helpers/sortTitle";
import { GameDetailsInput, GameItem } from "@/types/item";
import { MetadataMatch } from "@/types/metadata";
import { applyMetadata } from "@/lib/provider/applyMetadata";
import { fetchDetail } from "@/lib/provider/lookup";
import { changedLockableFields } from "@/lib/helpers/lockableField";
import { createLocks, insertItem, providerCommonLocks, providerValue, submittedCommonLocks, textOrNull, writeCommonDetails } from "@/lib/itemDetails";
import { attachGenres } from "@/lib/repository/genre";

export async function createGame(input: GameDetailsInput, match: MetadataMatch | null) {
    await startup();
    const detail = match ? await fetchDetail("game", String(match.providerId), input.platformId) : null;
    await withTransaction(async (client) => {
        const id = await insertItem(client, "game", input);
        await client.query(
            `INSERT INTO game (collection_item_id, platform_id, developer, publisher)
     VALUES ($1, $2, $3, $4)`,
            [id, input.platformId, textOrNull(input.developer), textOrNull(input.publisher)]
        );
        const changed = detail
            ? changedLockableFields("game", {
                ...providerCommonLocks(detail, input),
                developer: providerValue(detail, "developer"),
                publisher: providerValue(detail, "publisher"),
            }, {
                ...submittedCommonLocks(input),
                developer: input.developer,
                publisher: input.publisher,
            })
            : [];
        await writeCommonDetails(client, id, input, createLocks(changed, match));
        if (detail) await applyMetadata(id, detail, client);
    });
}

export async function getGames(): Promise<GameItem[]> {
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
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN game ON game.collection_item_id = collectionItem.id
    INNER JOIN platform ON platform.id = game.platform_id
    LEFT JOIN item_genre itemGenre ON itemGenre.collection_item_id = collectionItem.id AND itemGenre.is_primary
    LEFT JOIN genre ON genre.id = itemGenre.genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
  `);
    return attachGenres(result.rows.sort((a, b) => compareTitle(a.title, b.title)).map((row) => ({
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
    })));
}