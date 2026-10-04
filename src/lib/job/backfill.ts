import "server-only";
import pool from "@/lib/db";
import { getProviderStatuses } from "@/lib/providerSetting";
import { applyMetadata } from "@/lib/provider/applyMetadata";
import { fetchDetail, igdbPlatformId, providerFor } from "@/lib/provider/lookup";
import { runJob } from "@/lib/job/jobRun";
import { ItemType } from "@/types/item";
import { JobSummary } from "@/types/job";

export function normaliseTitle(title: string): string {
    return title
        .normalize("NFKD")
        .replace(/[̀-ͯ]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

export async function runBackfill(runId?: number): Promise<JobSummary> {
    return runJob("backfill", runId, async (progress) => {
        const statuses = await getProviderStatuses();
        const items = await pool.query(
            `SELECT collectionItem.id::int AS id, collectionItem.type, collectionItem.title,
            collectionItem.release_year, game.platform_id
     FROM collection_item collectionItem
     LEFT JOIN game ON game.collection_item_id = collectionItem.id
     WHERE collectionItem.provider_id IS NULL
     ORDER BY collectionItem.id`
        );

        for (const item of items.rows) {
            const type = item.type as ItemType;
            const { provider, client } = providerFor(type);
            if (!statuses[provider].configured) {
                await progress.count("skipped");
                continue;
            }
            try {
                const platformProviderId = type === "game" ? await igdbPlatformId(item.platform_id) : undefined;
                const results = await client.search(item.title, type, { platformProviderId });
                const title = normaliseTitle(item.title);
                const exact = results.filter(
                    (result) => normaliseTitle(result.title) === title
                        && (item.release_year === null || result.year === item.release_year)
                );
                if (exact.length !== 1) {
                    await progress.count("unmatched");
                    continue;
                }
                await applyMetadata(item.id, await fetchDetail(type, exact[0].provider_id, item.platform_id));
                await progress.count("matched");
            } catch {
                await progress.count("failed");
            }
        }
    });
}
