"use server";
import pool, { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { compareTitle } from "@/lib/helpers/sortTitle";
import { MovieDetailsInput, MovieItem } from "@/types/item";
import { MetadataMatch } from "@/types/metadata";
import { applyMetadata } from "@/lib/provider/applyMetadata";
import { fetchDetail } from "@/lib/provider/lookup";
import { changedLockableFields } from "@/lib/helpers/lockableField";
import { createLocks, insertItem, providerCommonLocks, providerValue, submittedCommonLocks, textOrNull, writeCommonDetails } from "@/lib/itemDetails";
import { attachGenres } from "@/lib/repository/genre";

export async function createMovie(input: MovieDetailsInput, match: MetadataMatch | null) {
    await startup();
    const detail = match ? await fetchDetail("movie", String(match.providerId), null) : null;
    await withTransaction(async (client) => {
        const id = await insertItem(client, "movie", input);
        await client.query(
            `INSERT INTO movie (collection_item_id, format_id, runtime_minutes, director, certification)
     VALUES ($1, $2, $3, $4, $5)`,
            [id, input.formatId, input.runtimeMinutes, textOrNull(input.director), textOrNull(input.certification)]
        );
        const changed = detail
            ? changedLockableFields("movie", {
                ...providerCommonLocks(detail, input),
                runtime_minutes: providerValue(detail, "runtime_minutes"),
                director: providerValue(detail, "director"),
                certification: providerValue(detail, "certification"),
            }, {
                ...submittedCommonLocks(input),
                runtime_minutes: input.runtimeMinutes,
                director: input.director,
                certification: input.certification,
            })
            : [];
        await writeCommonDetails(client, id, input, createLocks(changed, match));
        if (detail) await applyMetadata(id, detail, client);
    });
}

export async function getMovies(): Promise<MovieItem[]> {
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
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN movie ON movie.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = movie.format_id
    LEFT JOIN item_genre itemGenre ON itemGenre.collection_item_id = collectionItem.id AND itemGenre.is_primary
    LEFT JOIN genre ON genre.id = itemGenre.genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
  `);
    return attachGenres(result.rows.sort((a, b) => compareTitle(a.title, b.title)).map((row) => ({
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
    })));
}