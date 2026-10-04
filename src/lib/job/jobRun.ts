import "server-only";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { JobName, JobSummary } from "@/types/job";

const UNIQUE_VIOLATION = "23505";
const PROGRESS_EVERY = 10;

export class JobAlreadyRunningError extends Error {
    readonly code = "JOB_ALREADY_RUNNING";
    constructor(readonly jobName: JobName) {
        super(`${jobName} is already running`);
        this.name = "JobAlreadyRunningError";
    }
}

export async function startJobRun(jobName: JobName): Promise<number | null> {
    await startup();
    try {
        const result = await pool.query(
            `INSERT INTO job_run (job_name) VALUES ($1) RETURNING id::int AS id`,
            [jobName]
        );
        return result.rows[0].id;
    } catch (error) {
        if ((error as { code?: string }).code === UNIQUE_VIOLATION) return null;
        throw error;
    }
}

export type JobProgress = {
    count: (outcome: string) => Promise<void>;
    add: (outcome: string, amount: number) => void;
    setProcessed: (count: number) => void;
    summary: JobSummary;
    processed: () => number;
};

function createProgress(runId: number): JobProgress {
    const summary: JobSummary = {};
    let processed = 0;
    return {
        summary,
        processed: () => processed,
        add(outcome, amount) {
            summary[outcome] = (summary[outcome] ?? 0) + amount;
        },
        setProcessed(count) {
            processed = count;
        },
        async count(outcome) {
            processed += 1;
            summary[outcome] = (summary[outcome] ?? 0) + 1;
            if (processed % PROGRESS_EVERY === 0) {
                await pool.query(
                    `UPDATE job_run SET processed_count = $1, summary = $2 WHERE id = $3`,
                    [processed, summary, runId]
                );
            }
        },
    };
}

export async function runJob(
    jobName: JobName,
    runId: number | undefined,
    body: (progress: JobProgress, runId: number) => Promise<void>
): Promise<JobSummary> {
    await startup();
    const id = runId ?? await startJobRun(jobName);
    if (id === null) throw new JobAlreadyRunningError(jobName);
    const progress = createProgress(id);
    try {
        await body(progress, id);
        await pool.query(
            `UPDATE job_run SET status = 'success', finished_at = now(), processed_count = $1, summary = $2 WHERE id = $3`,
            [progress.processed(), progress.summary, id]
        );
    } catch (error) {
        await pool.query(
            `UPDATE job_run SET status = 'failed', finished_at = now(), processed_count = $1, summary = $2, error = $3 WHERE id = $4`,
            [progress.processed(), progress.summary, error instanceof Error ? error.message : String(error), id]
        );
    }
    return progress.summary;
}
