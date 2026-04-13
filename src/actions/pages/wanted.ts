"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameItem, MovieItem, ShowItem } from "@/types/item";

export async function getWantedGames(): Promise<GameItem[]> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      game.platform_id,
      platform.name AS platform_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN game ON game.collection_item_id = collectionItem.id
    INNER JOIN platform ON platform.id = game.platform_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    WHERE collectionItem.owned = false
    ORDER BY collectionItem.title
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "game" as const,
        owned: row.owned,
        platform_id: row.platform_id,
        platform_name: row.platform_name,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}

export async function getWantedMovies(): Promise<MovieItem[]> {
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
    WHERE collectionItem.owned = false
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

export async function getWantedShows(): Promise<ShowItem[]> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      show.format_id,
      format.name AS format_name,
      show.seasons_owned,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN show ON show.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = show.format_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    WHERE collectionItem.owned = false
    ORDER BY collectionItem.title
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "show" as const,
        owned: row.owned,
        format_id: row.format_id,
        format_name: row.format_name,
        seasons_owned: row.seasons_owned,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}

export async function markAsOwned(id: number) {
    await startup();
    await pool.query(
        `UPDATE collection_item SET owned = true WHERE id = $1`,
        [id]
    );
}