"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { ShowItem } from "@/types/item";
import { upsertFranchiseLink, removeFranchiseLink } from "@/actions/attributes/franchise";
import { upsertItemUrl, removeItemUrl } from "@/actions/attributes/url";

export async function getShowById(id: number): Promise<ShowItem | null> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      show.format_id,
      format.name AS format_name,
      show.seasons_owned,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN show ON show.collection_item_id = collectionItem.id
    INNER JOIN format ON format.id = show.format_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    WHERE collectionItem.id = $1
  `, [id]);

    if (result.rows.length === 0) return null;
    const row = result.rows[0];

    return {
        id: row.id,
        title: row.title,
        type: "show" as const,
        owned: row.owned,
        format_id: row.format_id,
        format_name: row.format_name,
        seasons_owned: row.seasons_owned,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    };
}

export async function updateShowDetails(
    id: number,
    title: string,
    owned: boolean,
    formatId: number,
    seasonsOwned: number,
    franchiseName: string,
    franchiseOrder: number | null,
    siteUrl: string,
    siteLabel: string
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
    if (franchiseName.trim()) {
        await upsertFranchiseLink(id, franchiseName.trim(), franchiseOrder);
    } else {
        await removeFranchiseLink(id);
    }
    if (siteUrl.trim()) {
        await upsertItemUrl(id, siteUrl.trim(), siteLabel.trim() || null);
    } else {
        await removeItemUrl(id);
    }
}