"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";

export async function upsertItemUrl(
    collectionItemId: number,
    siteUrl: string,
    siteLabel: string | null
) {
    await startup();
    await pool.query(
        `INSERT INTO item_url (collection_item_id, site_url, site_label)
     VALUES ($1, $2, $3)
     ON CONFLICT (collection_item_id)
     DO UPDATE SET site_url = $2, site_label = $3`,
        [collectionItemId, siteUrl, siteLabel]
    );
}

export async function removeItemUrl(collectionItemId: number) {
    await startup();
    await pool.query(
        `DELETE FROM item_url WHERE collection_item_id = $1`,
        [collectionItemId]
    );
}