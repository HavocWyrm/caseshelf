import "server-only";
import { runBackfill } from "@/lib/job/backfill";
import { runCleanup } from "@/lib/job/cleanup";
import { runRefreshStale } from "@/lib/job/refreshStale";
import { JobName, JobSummary } from "@/types/job";

export const JOB: Record<JobName, { title: string; description: string; run: (runId?: number) => Promise<JobSummary> }> = {
    backfill: {
        title: "Match unlinked items",
        description: "Searches TMDB/IGDB for items without a match and links them only when exactly one result has the same title and, where the item has one, the same year. Matched items take the provider's metadata.",
        run: runBackfill,
    },
    refresh_stale: {
        title: "Refresh stale metadata",
        description: "Fetches metadata again for matched items not refreshed within the configured number of days. Locked fields are kept.",
        run: runRefreshStale,
    },
    cleanup: {
        title: "Clean up",
        description: "Removes unused franchises, items missing their game/movie/show record, lock names that no longer apply, and job history beyond the last 50 runs per job.",
        run: runCleanup,
    },
};

export function isJobName(value: unknown): value is JobName {
    return typeof value === "string" && Object.hasOwn(JOB, value);
}
