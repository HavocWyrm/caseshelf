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