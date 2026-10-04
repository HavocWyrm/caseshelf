"use server";
import pool, { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { compareTitle } from "@/lib/helpers/sortTitle";
import { ShowDetailsInput, ShowItem } from "@/types/item";
import { MetadataMatch } from "@/types/metadata";
import { applyMetadata } from "@/lib/provider/applyMetadata";
import { fetchDetail } from "@/lib/provider/lookup";
import { changedLockableFields } from "@/lib/helpers/lockableField";
import { createLocks, insertItem, providerCommonLocks, providerValue, submittedCommonLocks, textOrNull, writeCommonDetails } from "@/lib/itemDetails";
import { attachGenres } from "@/lib/repository/genre";

export async function createShow(input: ShowDetailsInput, match: MetadataMatch | null) {
  await startup();
  const detail = match ? await fetchDetail("show", String(match.providerId), null) : null;
  await withTransaction(async (client) => {
    const id = await insertItem(client, "show", input);
    await client.query(
      `INSERT INTO show (collection_item_id, format_id, seasons_owned, total_seasons, network, series_status)
     VALUES ($1, $2, $3, $4, $5, $6)`,
      [id, input.formatId, input.seasonsOwned, input.totalSeasons, textOrNull(input.network), textOrNull(input.seriesStatus)]
    );
    const changed = detail
      ? changedLockableFields("show", {
        ...providerCommonLocks(detail, input),
        total_seasons: providerValue(detail, "total_seasons"),
        network: providerValue(detail, "network"),
        series_status: providerValue(detail, "series_status"),
      }, {
        ...submittedCommonLocks(input),
        total_seasons: input.totalSeasons,
        network: input.network,
        series_status: input.seriesStatus,
      })
      : [];
    await writeCommonDetails(client, id, input, createLocks(changed, match));
    if (detail) await applyMetadata(id, detail, client);
  });
}

export async function getShows(): Promise<ShowItem[]> {
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
      show.seasons_owned,
      genre.name AS primary_genre_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN show ON show.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = show.format_id
    LEFT JOIN item_genre itemGenre ON itemGenre.collection_item_id = collectionItem.id AND itemGenre.is_primary
    LEFT JOIN genre ON genre.id = itemGenre.genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
  `);
  return attachGenres(result.rows.sort((a, b) => compareTitle(a.title, b.title)).map((row) => ({
    id: row.id,
    title: row.title,
    type: "show" as const,
    owned: row.owned,
    release_year: row.release_year ?? null,
    format_id: row.format_id,
    format_name: row.format_name,
    seasons_owned: row.seasons_owned,
    primary_genre_name: row.primary_genre_name ?? null,
    franchise_name: row.franchise_name ?? null,
    franchise_order: row.franchise_order ?? null,
    site_label: row.site_label ?? null,
    site_url: row.site_url ?? null,
  })));
}