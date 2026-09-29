"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { MovieItem } from "@/types/item";
import { upsertFranchiseLink, removeFranchiseLink } from "@/actions/attributes/franchise";
import { upsertItemUrl, removeItemUrl } from "@/actions/attributes/url";

export async function createMovie(
    title: string,
    owned: boolean,
    formatId: number,
    genreId: number | null,
    releaseYear: number | null,
    franchiseName: string,
    franchiseOrder: number | null,
    siteUrl: string,
    siteLabel: string
) {
    await startup();
    const result = await pool.query(
        `INSERT INTO collection_item (title, type, owned, release_year)
     VALUES ($1, 'movie', $2, $3)
     RETURNING id`,
        [title, owned, releaseYear]
    );
    const itemId = result.rows[0].id;
    await pool.query(
        `INSERT INTO movie (collection_item_id, format_id, primary_genre_id)
     VALUES ($1, $2, $3)`,
        [itemId, formatId, genreId]
    );
    if (franchiseName.trim()) {
        await upsertFranchiseLink(itemId, franchiseName.trim(), franchiseOrder);
    }
    if (siteUrl.trim()) {
        await upsertItemUrl(itemId, siteUrl.trim(), siteLabel.trim() || null);
    }
}

export async function updateMovie(
    id: number,
    title: string,
    owned: boolean,
    formatId: number,
    genreId: number | null,
    releaseYear: number | null,
    franchiseName: string,
    franchiseOrder: number | null,
    siteUrl: string,
    siteLabel: string
) {
    await startup();
    await pool.query(
        `UPDATE collection_item SET title = $1, owned = $2, release_year = $3 WHERE id = $4`,
        [title, owned, releaseYear, id]
    );
    await pool.query(
        `UPDATE movie SET format_id = $1, primary_genre_id = $2 WHERE collection_item_id = $3`,
        [formatId, genreId, id]
    );
    if (franchiseName.trim()) {
        await upsertFranchiseLink(id, franchiseName.trim(), franchiseOrder);
    } else {
        await removeFranchiseLink(id);
    }
    if (siteUrl.trim()) {
        await upsertItemUrl(id, siteUrl.trim(), siteLabel.trim() || null);
    } else {
        await removeItemUrl(id);
    }
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
      movie.primary_genre_id,
      mediaGenre.name AS primary_genre_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN movie ON movie.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = movie.format_id
    LEFT JOIN media_genre mediaGenre ON mediaGenre.id = movie.primary_genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    ORDER BY collectionItem.title
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "movie" as const,
        owned: row.owned,
        release_year: row.release_year ?? null,
        format_id: row.format_id,
        format_name: row.format_name,
        primary_genre_id: row.primary_genre_id ?? null,
        primary_genre_name: row.primary_genre_name ?? null,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}