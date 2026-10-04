import "server-only";
import pool from "@/lib/db";
import { LOCKABLE_FIELD } from "@/lib/helpers/lockableField";
import { runJob } from "@/lib/job/jobRun";
import { ItemType } from "@/types/item";
import { JobSummary } from "@/types/job";

const KEEP_RUNS_PER_JOB = 50;

export async function runCleanup(runId?: number): Promise<JobSummary> {
    return runJob("cleanup", runId, async (progress, currentRunId) => {
        const franchises = await pool.query(
            `DELETE FROM franchise
     WHERE NOT EXISTS (SELECT 1 FROM franchise_item WHERE franchise_item.franchise_id = franchise.id)`
        );
        progress.add("franchises", franchises.rowCount ?? 0);

        const brokenItems = await pool.query(
            `DELETE FROM collection_item collectionItem
     WHERE (collectionItem.type = 'game' AND NOT EXISTS (SELECT 1 FROM game WHERE game.collection_item_id = collectionItem.id))
        OR (collectionItem.type = 'movie' AND NOT EXISTS (SELECT 1 FROM movie WHERE movie.collection_item_id = collectionItem.id))
        OR (collectionItem.type = 'show' AND NOT EXISTS (SELECT 1 FROM show WHERE show.collection_item_id = collectionItem.id))`
        );
        progress.add("brokenItems", brokenItems.rowCount ?? 0);

        let staleLocks = 0;
        for (const type of Object.keys(LOCKABLE_FIELD) as ItemType[]) {
            const allowed = [...LOCKABLE_FIELD[type]];
            const result = await pool.query(
                `UPDATE collection_item
     SET locked_field = ARRAY(SELECT field FROM unnest(locked_field) AS field WHERE field = ANY($2::text[]))
     WHERE type = $1 AND NOT (locked_field <@ $2::text[])`,
                [type, allowed]
            );
            staleLocks += result.rowCount ?? 0;
        }
        progress.add("staleLocks", staleLocks);

        const jobRuns = await pool.query(
            `DELETE FROM job_run
     WHERE status <> 'running' AND id <> $1
       AND id NOT IN (
         SELECT id FROM (
           SELECT id, row_number() OVER (PARTITION BY job_name ORDER BY started_at DESC) AS position
           FROM job_run
         ) ranked
         WHERE position <= $2
       )`,
            [currentRunId, KEEP_RUNS_PER_JOB]
        );
        progress.add("jobRuns", jobRuns.rowCount ?? 0);

        progress.setProcessed(Object.values(progress.summary).reduce((total, count) => total + count, 0));
    });
}
