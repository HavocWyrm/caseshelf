import "server-only";
import pool from "@/lib/db";
import { getProviderStatuses } from "@/lib/providerSetting";
import { applyMetadata } from "@/lib/provider/applyMetadata";
import { fetchDetail, providerFor } from "@/lib/provider/lookup";
import { getStaleDays } from "@/lib/job/jobSetting";
import { runJob } from "@/lib/job/jobRun";
import { ItemType } from "@/types/item";
import { JobSummary } from "@/types/job";

export async function runRefreshStale(runId?: number): Promise<JobSummary> {
    return runJob("refresh_stale", runId, async (progress) => {
        const [statuses, staleDays] = await Promise.all([getProviderStatuses(), getStaleDays()]);
        const items = await pool.query(
            `SELECT collectionItem.id::int AS id, collectionItem.type, collectionItem.provider_id, game.platform_id
     FROM collection_item collectionItem
     LEFT JOIN game ON game.collection_item_id = collectionItem.id
     WHERE collectionItem.provider_id IS NOT NULL
       AND (collectionItem.metadata_fetched_at IS NULL
         OR collectionItem.metadata_fetched_at < now() - make_interval(days => $1))
     ORDER BY collectionItem.metadata_fetched_at NULLS FIRST, collectionItem.id`,
            [staleDays]
        );

        for (const item of items.rows) {
            const type = item.type as ItemType;
            if (!statuses[providerFor(type).provider].configured) {
                await progress.count("skipped");
                continue;
            }
            try {
                await applyMetadata(item.id, await fetchDetail(type, item.provider_id, item.platform_id));
                await progress.count("refreshed");
            } catch {
                await progress.count("failed");
            }
        }
    });
}
