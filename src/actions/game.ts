"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { GameItem } from "@/types/item";
import { upsertFranchiseLink, removeFranchiseLink } from "@/actions/franchise";
import { upsertItemUrl, removeItemUrl } from "@/actions/url";

export async function createGame(
    title: string,
    owned: boolean,
    platformId: number,
    franchiseName: string,
    franchiseOrder: number | null,
    siteUrl: string,
    siteLabel: string
) {
    await startup();
    const result = await pool.query(
        `INSERT INTO collection_item (title, type, owned)
     VALUES ($1, 'game', $2)
     RETURNING id`,
        [title, owned]
    );
    const itemId = result.rows[0].id;
    await pool.query(
        `INSERT INTO game (collection_item_id, platform_id) VALUES ($1, $2)`,
        [itemId, platformId]
    );
    if (franchiseName.trim()) {
        await upsertFranchiseLink(itemId, franchiseName.trim(), franchiseOrder);
    }
    if (siteUrl.trim()) {
        await upsertItemUrl(itemId, siteUrl.trim(), siteLabel.trim() || null);
    }
}

export async function updateGame(
    id: number,
    title: string,
    owned: boolean,
    platformId: number,
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
        `UPDATE game SET platform_id = $1 WHERE collection_item_id = $2`,
        [platformId, id]
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

export async function getGames(): Promise<GameItem[]> {
    await startup();
    const result = await pool.query(`
    SELECT
      collectionItem.id,
      collectionItem.title,
      collectionItem.type,
      collectionItem.owned,
      game.platform_id,
      platform.name AS platform_name,
      franchise.name AS franchise_name,
      franchiseItem.franchise_order,
      item_url.site_label,
      item_url.site_url
    FROM collection_item collectionItem
    INNER JOIN game ON game.collection_item_id = collectionItem.id
    INNER JOIN platform ON platform.id = game.platform_id
    LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
    LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
    LEFT JOIN item_url ON item_url.collection_item_id = collectionItem.id
    ORDER BY collectionItem.title
  `);
    return result.rows.map((row) => ({
        id: row.id,
        title: row.title,
        type: "game" as const,
        owned: row.owned,
        platform_id: row.platform_id,
        platform_name: row.platform_name,
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
        site_label: row.site_label ?? null,
        site_url: row.site_url ?? null,
    }));
}