"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { MovieItem } from "@/types/item";
import { upsertFranchiseLink, removeFranchiseLink } from "@/actions/franchise";

export async function createMovie(
    title: string,
    owned: boolean,
    formatId: number,
    franchiseName: string,
    franchiseOrder: number | null,
    site_label: string | null,
    site_url: string | null
) {
    await startup();
    const result = await pool.query(
        `INSERT INTO collection_item (title, type, owned)
     VALUES ($1, 'movie', $2)
     RETURNING id`,
        [title, owned]
    );
    const itemId = result.rows[0].id;
    await pool.query(
        `INSERT INTO movie (collection_item_id, format_id) VALUES ($1, $2)`,
        [itemId, formatId]
    );
    if (franchiseName.trim()) {
        await upsertFranchiseLink(itemId, franchiseName.trim(), franchiseOrder);
    }
}

export async function updateMovie(
    id: number,
    title: string,
    owned: boolean,
    formatId: number,
    franchiseName: string,
    franchiseOrder: number | null,
    site_label: string | null,
    site_url: string | null
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
    if (franchiseName.trim()) {
        await upsertFranchiseLink(id, franchiseName.trim(), franchiseOrder);
    } else {
        await removeFranchiseLink(id);
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
      movie.format_id,
      format.name AS format_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN movie ON movie.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = movie.format_id
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
        format_id: row.format_id,
        format_name: row.format_name,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}