"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { JOB, isJobName } from "@/lib/job/registry";
import { startJobRun } from "@/lib/job/jobRun";
import { getStaleDays, saveStaleDays, validStaleDays } from "@/lib/job/jobSetting";
import { JobName, JobOverview, JobRun, RunJobResult } from "@/types/job";

function toIso(value: Date | string | null): string | null {
    return value ? new Date(value).toISOString() : null;
}

export async function getJobOverviews(): Promise<{ jobs: JobOverview[]; staleDays: number }> {
    await startup();
    const [latest, staleDays] = await Promise.all([
        pool.query(
            `SELECT DISTINCT ON (job_name) job_name, id::int AS id, status, started_at, finished_at, processed_count, summary, error
       FROM job_run
       ORDER BY job_name, started_at DESC`
        ),
        getStaleDays(),
    ]);
    const lastRuns = new Map<string, JobRun>(
        latest.rows.map((row) => [row.job_name, {
            id: row.id,
            status: row.status,
            started_at: toIso(row.started_at)!,
            finished_at: toIso(row.finished_at),
            processed_count: row.processed_count,
            summary: row.summary ?? {},
            error: row.error,
        }])
    );
    const jobs = (Object.keys(JOB) as JobName[]).map((name) => ({
        name,
        title: JOB[name].title,
        description: JOB[name].description,
        lastRun: lastRuns.get(name) ?? null,
    }));
    return { jobs, staleDays };
}

// Currently relies on Node server, might switch to a cron thing later IDK
export async function runJobNow(name: string): Promise<RunJobResult> {
    if (!isJobName(name)) throw new Error(`Unknown job: ${name}`);
    const runId = await startJobRun(name);
    if (runId === null) return { ok: false, message: `${JOB[name].title} is already running.` };
    void JOB[name].run(runId).catch((error) => console.error(`Job ${name} (run ${runId}) failed to finish:`, error));
    return { ok: true, runId };
}

export async function saveJobStaleDays(days: number): Promise<number> {
    const valid = validStaleDays(days);
    if (valid === null) throw new Error("Stale days must be a whole number from 1 to 3650");
    await saveStaleDays(valid);
    return valid;
}
