"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

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