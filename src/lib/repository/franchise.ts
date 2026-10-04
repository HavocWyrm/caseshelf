import "server-only";
import pool, { Queryable } from "@/lib/db";
import { startup } from "@/lib/startup";

export async function upsertFranchiseLink(
    collectionItemId: number,
    franchiseName: string,
    franchiseOrder: number | null,
    db: Queryable = pool
) {
    await startup();

    let franchiseId: number;

    const existing = await db.query(
        `SELECT id FROM franchise WHERE lower(name) = lower($1) ORDER BY id LIMIT 1`,
        [franchiseName]
    );

    if (existing.rows.length != 0) {
        franchiseId = existing.rows[0].id;
    } else {
        const created = await db.query(
            `INSERT INTO franchise (name) VALUES ($1) RETURNING id`,
            [franchiseName]
        );
        franchiseId = created.rows[0].id;
    }

    await db.query(
        `INSERT INTO franchise_item (franchise_id, collection_item_id, franchise_order)
     VALUES ($1, $2, $3)
     ON CONFLICT (collection_item_id)
     DO UPDATE SET franchise_id = $1, franchise_order = $3`,
        [franchiseId, collectionItemId, franchiseOrder]
    );
}

export async function removeFranchiseLink(collectionItemId: number, db: Queryable = pool) {
    await startup();
    await db.query(
        `DELETE FROM franchise_item WHERE collection_item_id = $1`,
        [collectionItemId]
    );
}
