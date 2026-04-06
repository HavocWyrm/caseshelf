"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameItem } from "@/types/item";

export async function createGame(
    title: string,
    owned: boolean,
    platformId: number
) {
    await startup();
    const itemResult = await pool.query(
        `INSERT INTO collection_item (title, type, owned)
     VALUES ($1, 'game', $2)
     RETURNING id`,
        [title, owned]
    );
    await pool.query(
        `INSERT INTO game (collection_item_id, platform_id)
     VALUES ($1, $2)`,
        [itemResult.rows[0].id, platformId]
    );
}

export async function updateGame(
    id: number,
    title: string,
    owned: boolean,
    platformId: number
) {
    await startup();
    await pool.query(
        `UPDATE collection_item SET title = $1, owned = $2 WHERE id = $3`,
        [title, owned, id]
    );
    await pool.query(
        `UPDATE game SET platform_id = $1 WHERE collection_item_id = $2`,
        [platformId, id]
    );
}

export async function getGames(): Promise<GameItem[]> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      game.platform_id,
      platform.name AS platform_name
    FROM collection_item collectionItem
    INNER JOIN game ON game.collection_item_id = collectionItem.id
    INNER JOIN platform ON platform.id = game.platform_id
    ORDER BY collectionItem.title
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "game" as const,
        owned: row.owned,
        platform_id: row.platform_id,
        platform_name: row.platform_name,
    }));
}