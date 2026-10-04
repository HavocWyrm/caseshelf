"use server";
import pool, { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { ShowDetail, ShowDetailsInput } from "@/types/item";
import { attachGenres } from "@/lib/repository/genre";
import { changedLockableFields, mergeLocks } from "@/lib/helpers/lockableField";
import { readCommonDetails, storedCommonLocks, submittedCommonLocks, textOrNull, writeCommonDetails } from "@/lib/itemDetails";

export async function getShowById(id: number): Promise<ShowDetail | null> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      collectionItem.release_year,
      show.format_id,
      format.name AS format_name,
      genre.name AS primary_genre_name,
      show.seasons_owned,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url,
      collectionItem.synopsis,
      collectionItem.provider,
      collectionItem.provider_id,
      collectionItem.metadata_fetched_at,
      collectionItem.locked_field,
      show.total_seasons,
      show.network,
      show.series_status
    FROM collection_item collectionItem
    INNER JOIN show ON show.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = show.format_id
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
        type: "show" as const,
        owned: row.owned,
        release_year: row.release_year ?? null,
        format_id: row.format_id,
        format_name: row.format_name,
        primary_genre_name: row.primary_genre_name ?? null,
        seasons_owned: row.seasons_owned,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
        synopsis: row.synopsis ?? null,
        provider: row.provider ?? null,
        provider_id: row.provider_id ?? null,
        metadata_fetched_at: row.metadata_fetched_at ? new Date(row.metadata_fetched_at).toISOString() : null,
        locked_field: row.locked_field ?? [],
        total_seasons: row.total_seasons ?? null,
        network: row.network ?? null,
        series_status: row.series_status ?? null,
    }]);
    return item;
}

export async function updateShowDetails(id: number, input: ShowDetailsInput) {
    await startup();
    await withTransaction(async (client) => {
        const stored = await readCommonDetails(client, id);
        const result = await client.query(
            `SELECT total_seasons, network, series_status FROM show WHERE collection_item_id = $1`,
            [id]
        );
        const row = result.rows[0];
        const changed = changedLockableFields("show", {
            ...storedCommonLocks(stored),
            total_seasons: row.total_seasons,
            network: row.network,
            series_status: row.series_status,
        }, {
            ...submittedCommonLocks(input),
            total_seasons: input.totalSeasons,
            network: input.network,
            series_status: input.seriesStatus,
        });

        await writeCommonDetails(client, id, input, mergeLocks(stored.locked_field, changed));
        await client.query(
            `UPDATE show SET format_id = $1, seasons_owned = $2, total_seasons = $3, network = $4, series_status = $5 WHERE collection_item_id = $6`,
            [input.formatId, input.seasonsOwned, input.totalSeasons, textOrNull(input.network), textOrNull(input.seriesStatus), id]
        );
    });
}
