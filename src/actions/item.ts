"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { CollectionItem } from "@/types/item";

export async function getItems(): Promise<CollectionItem[]> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      game.platform_id,
      platform.name AS platform_name,
      movie.format_id AS movie_format_id,
      movieFormat.name AS movie_format_name,
      show.format_id AS show_format_id,
      showFormat.name AS show_format_name,
      show.seasons_owned
    FROM collection_item collectionItem
    LEFT JOIN game ON game.collection_item_id = collectionItem.id
    LEFT JOIN platform ON platform.id = game.platform_id
    LEFT JOIN movie ON movie.collection_item_id = collectionItem.id
    LEFT JOIN format movieFormat ON movieFormat.id = movie.format_id
    LEFT JOIN show ON show.collection_item_id = collectionItem.id
    LEFT JOIN format showFormat ON showFormat.id = show.format_id
    ORDER BY collectionItem.id
  `);

    return result.rows.map((row) => {
        if (row.type === "game") {
            return {
                id: row.id,
                title: row.title,
                type: "game" as const,
                owned: row.owned,
                platform_id: row.platform_id,
                platform_name: row.platform_name,
            };
        } else if (row.type === "movie") {
            return {
                id: row.id,
                title: row.title,
                type: "movie" as const,
                owned: row.owned,
                format_id: row.movie_format_id,
                format_name: row.movie_format_name,
            };
        } else {
            return {
                id: row.id,
                title: row.title,
                type: "show" as const,
                owned: row.owned,
                format_id: row.show_format_id,
                format_name: row.show_format_name,
                seasons_owned: row.seasons_owned,
            };
        }
    });
}

export async function deleteItem(id: number) {
    await startup();
    await pool.query(
        `DELETE FROM collection_item WHERE id = $1`,
        [id]
    );
}

export async function getDashboardCounts(): Promise<Record<string, { owned: number; total: number }>> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.type,
      COUNT(*) AS total,
      COUNT(*) FILTER (WHERE collectionItem.owned = true) AS owned
    FROM collection_item collectionItem
    GROUP BY collectionItem.type
  `);

    const counts: Record<string, { owned: number; total: number }> = {
        game: { owned: 0, total: 0 },
        movie: { owned: 0, total: 0 },
        show: { owned: 0, total: 0 },
    };

    for (const row of result.rows) {
        counts[row.type] = {
            owned: Number(row.owned),
            total: Number(row.total),
        };
    }

    return counts;
}