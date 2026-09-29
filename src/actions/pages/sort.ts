"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameItem, MovieItem, ShowItem } from "@/types/item";

export async function getSortedGames(): Promise<GameItem[]> {
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
      game.primary_genre_id,
      gameGenre.name AS primary_genre_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN game ON game.collection_item_id = collectionItem.id
    INNER JOIN platform ON platform.id = game.platform_id
    LEFT JOIN game_genre gameGenre ON gameGenre.id = game.primary_genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    WHERE collectionItem.owned = true
    ORDER BY
      platform.sort_order NULLS LAST,
      platform.name,
      gameGenre.sort_order NULLS LAST,
      gameGenre.name,
      COALESCE(franchise.name, collectionItem.title),
      franchiseItem.franchise_order NULLS FIRST,
      collectionItem.title,
      collectionItem.release_year NULLS LAST
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "game" as const,
        owned: row.owned,
        release_year: row.release_year ?? null,
        platform_id: row.platform_id,
        platform_name: row.platform_name,
        primary_genre_id: row.primary_genre_id ?? null,
        primary_genre_name: row.primary_genre_name ?? null,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}

export async function getSortedMovies(): Promise<MovieItem[]> {
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
    WHERE collectionItem.owned = true
    ORDER BY
      format.sort_order NULLS LAST,
      format.name,
      mediaGenre.sort_order NULLS LAST,
      mediaGenre.name,
      COALESCE(franchise.name, collectionItem.title),
      franchiseItem.franchise_order NULLS FIRST,
      collectionItem.title,
      collectionItem.release_year NULLS LAST
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

export async function getSortedShows(): Promise<ShowItem[]> {
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
      show.primary_genre_id,
      mediaGenre.name AS primary_genre_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN show ON show.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = show.format_id
    LEFT JOIN media_genre mediaGenre ON mediaGenre.id = show.primary_genre_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    WHERE collectionItem.owned = true
    ORDER BY
      format.sort_order NULLS LAST,
      format.name,
      mediaGenre.sort_order NULLS LAST,
      mediaGenre.name,
      COALESCE(franchise.name, collectionItem.title),
      franchiseItem.franchise_order NULLS FIRST,
      collectionItem.title,
      collectionItem.release_year NULLS LAST
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "show" as const,
        owned: row.owned,
        release_year: row.release_year ?? null,
        format_id: row.format_id,
        format_name: row.format_name,
        seasons_owned: row.seasons_owned,
        primary_genre_id: row.primary_genre_id ?? null,
        primary_genre_name: row.primary_genre_name ?? null,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}