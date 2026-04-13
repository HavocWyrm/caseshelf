"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

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