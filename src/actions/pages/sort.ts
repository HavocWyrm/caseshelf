"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { attachGenres } from "@/lib/repository/genre";
import { compareNumber, compareText, compareTitle } from "@/lib/helpers/sortTitle";
import { GameItem, MovieItem, ShowItem } from "@/types/item";

type ShelfRow = {
  title: string;
  release_year: number | null;
  franchise_name: string | null;
  franchise_order: number | null;
  genre_sort_order: number | null;
  primary_genre_name: string | null;
  platform_sort_order?: number | null;
  platform_name?: string;
};

function compareShelfPosition(a: ShelfRow, b: ShelfRow): number {
  return (
    compareNumber(a.platform_sort_order ?? null, b.platform_sort_order ?? null) ||
    compareText(a.platform_name ?? null, b.platform_name ?? null) ||
    compareNumber(a.genre_sort_order, b.genre_sort_order) ||
    compareText(a.primary_genre_name, b.primary_genre_name) ||
    compareTitle(a.franchise_name ?? a.title, b.franchise_name ?? b.title) ||
    compareNumber(a.franchise_order, b.franchise_order, "first") ||
    compareTitle(a.title, b.title) ||
    compareNumber(a.release_year, b.release_year)
  );
}

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
      platform.short_name AS platform_short_name,
      platform.igdb_platform_id AS platform_igdb_id,
      platform.sort_order AS platform_sort_order,
      genre.name AS primary_genre_name,
      genre.sort_order AS genre_sort_order,
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
    WHERE collectionItem.owned = true
  `);
  return attachGenres(result.rows.sort(compareShelfPosition).map((row) => ({
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
      genre.name AS primary_genre_name,
      genre.sort_order AS genre_sort_order,
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
    WHERE collectionItem.owned = true
  `);
  return attachGenres(result.rows.sort(compareShelfPosition).map((row) => ({
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
      genre.name AS primary_genre_name,
      genre.sort_order AS genre_sort_order,
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
    WHERE collectionItem.owned = true
  `);
  return attachGenres(result.rows.sort(compareShelfPosition).map((row) => ({
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
