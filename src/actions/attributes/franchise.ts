"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

export async function searchFranchises(query: string): Promise<string[]> {
    await startup();
    const result = await pool.query(
        `SELECT name FROM franchise
     WHERE name ILIKE $1
     ORDER BY name
     LIMIT 10`,
        [`%${query}%`]
    );
    return result.rows.map((row) => row.name);
}

export async function upsertFranchiseLink(
    collectionItemId: number,
    franchiseName: string,
    franchiseOrder: number | null
) {
    await startup();

    let franchiseId: number;

    const existing = await pool.query(
        `SELECT id FROM franchise WHERE name = $1`,
        [franchiseName]
    );

    if (existing.rows.length != 0) {
        franchiseId = existing.rows[0].id;
    } else {
        const created = await pool.query(
            `INSERT INTO franchise (name) VALUES ($1) RETURNING id`,
            [franchiseName]
        );
        franchiseId = created.rows[0].id;
    }

    await pool.query(
        `INSERT INTO franchise_item (franchise_id, collection_item_id, franchise_order)
     VALUES ($1, $2, $3)
     ON CONFLICT (franchise_id, collection_item_id)
     DO UPDATE SET franchise_order = $3`,
        [franchiseId, collectionItemId, franchiseOrder]
    );
}

export async function removeFranchiseLink(collectionItemId: number) {
    await startup();
    await pool.query(
        `DELETE FROM franchise_item WHERE collection_item_id = $1`,
        [collectionItemId]
    );
}

export async function getFranchisesForType(
    type: "game" | "movie" | "show"
): Promise<string[]> {
    await startup();
    const result = await pool.query(
        `SELECT DISTINCT franchise.name
     FROM franchise
     INNER JOIN franchise_item ON franchise_item.franchise_id = franchise.id
     INNER JOIN collection_item ON collection_item.id = franchise_item.collection_item_id
     WHERE collection_item.type = $1
     ORDER BY franchise.name`,
        [type]
    );
    return result.rows.map((row) => row.name);
}