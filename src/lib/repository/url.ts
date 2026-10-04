import "server-only";
import pool, { Queryable } from "@/lib/db";
import { startup } from "@/lib/startup";
import { normaliseListingUrl } from "@/lib/helpers/listingUrl";

export async function upsertItemUrl(
    collectionItemId: number,
    siteUrl: string,
    siteLabel: string | null,
    db: Queryable = pool
) {
    await startup();
    await db.query(
        `INSERT INTO item_url (collection_item_id, site_url, site_label)
     VALUES ($1, $2, $3)
     ON CONFLICT (collection_item_id)
     DO UPDATE SET site_url = $2, site_label = $3`,
        [collectionItemId, normaliseListingUrl(siteUrl), siteLabel]
    );
}

export async function removeItemUrl(collectionItemId: number, db: Queryable = pool) {
    await startup();
    await db.query(
        `DELETE FROM item_url WHERE collection_item_id = $1`,
        [collectionItemId]
    );
}
