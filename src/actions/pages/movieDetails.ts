"use server";
import pool, { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { MovieDetail, MovieDetailsInput } from "@/types/item";
import { attachGenres } from "@/lib/repository/genre";
import { changedLockableFields, mergeLocks } from "@/lib/helpers/lockableField";
import { readCommonDetails, storedCommonLocks, submittedCommonLocks, textOrNull, writeCommonDetails } from "@/lib/itemDetails";

export async function getMovieById(id: number): Promise<MovieDetail | null> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      collectionItem.release_year,
      movie.format_id,
      format.name AS format_name,
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
      movie.runtime_minutes,
      movie.director,
      movie.certification
    FROM collection_item collectionItem
    INNER JOIN movie ON movie.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = movie.format_id
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
        type: "movie" as const,
        owned: row.owned,
        release_year: row.release_year ?? null,
        format_id: row.format_id,
        format_name: row.format_name,
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
        runtime_minutes: row.runtime_minutes ?? null,
        director: row.director ?? null,
        certification: row.certification ?? null,
    }]);
    return item;
}

export async function updateMovieDetails(id: number, input: MovieDetailsInput) {
    await startup();
    await withTransaction(async (client) => {
        const stored = await readCommonDetails(client, id);
        const result = await client.query(
            `SELECT runtime_minutes, director, certification FROM movie WHERE collection_item_id = $1`,
            [id]
        );
        const row = result.rows[0];
        const changed = changedLockableFields("movie", {
            ...storedCommonLocks(stored),
            runtime_minutes: row.runtime_minutes,
            director: row.director,
            certification: row.certification,
        }, {
            ...submittedCommonLocks(input),
            runtime_minutes: input.runtimeMinutes,
            director: input.director,
            certification: input.certification,
        });

        await writeCommonDetails(client, id, input, mergeLocks(stored.locked_field, changed));
        await client.query(
            `UPDATE movie SET format_id = $1, runtime_minutes = $2, director = $3, certification = $4 WHERE collection_item_id = $5`,
            [input.formatId, input.runtimeMinutes, textOrNull(input.director), textOrNull(input.certification), id]
        );
    });
}
