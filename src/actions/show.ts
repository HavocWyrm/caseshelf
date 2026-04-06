"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { ShowItem } from "@/types/item";

export async function createShow(
  title: string,
  owned: boolean,
  formatId: number,
  seasonsOwned: number
) {
  await startup();
  const itemResult = await pool.query(
    `INSERT INTO collection_item (title, type, owned)
     VALUES ($1, 'show', $2)
     RETURNING id`,
    [title, owned]
  );
  await pool.query(
    `INSERT INTO show (collection_item_id, format_id, seasons_owned)
     VALUES ($1, $2, $3)`,
    [itemResult.rows[0].id, formatId, seasonsOwned]
  );
}

export async function updateShow(
  id: number,
  title: string,
  owned: boolean,
  formatId: number,
  seasonsOwned: number
) {
  await startup();
  await pool.query(
    `UPDATE collection_item SET title = $1, owned = $2 WHERE id = $3`,
    [title, owned, id]
  );
  await pool.query(
    `UPDATE show SET format_id = $1, seasons_owned = $2 WHERE collection_item_id = $3`,
    [formatId, seasonsOwned, id]
  );
}

export async function getShows(): Promise<ShowItem[]> {
  await startup();
  const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      show.format_id,
      format.name AS format_name,
      show.seasons_owned
    FROM collection_item collectionItem
    INNER JOIN show ON show.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = show.format_id
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
  }));
}