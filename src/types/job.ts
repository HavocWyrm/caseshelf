export type JobName = "backfill" | "refresh_stale" | "cleanup";

export type JobRunStatus = "running" | "success" | "failed";

export type JobSummary = Record<string, number>;

export type JobRun = {
    id: number;
    status: JobRunStatus;
    started_at: string;
    finished_at: string | null;
    processed_count: number;
    summary: JobSummary;
    error: string | null;
};

export type JobOverview = {
    name: JobName;
    title: string;
    description: string;
    lastRun: JobRun | null;
};

export type RunJobResult = { ok: true; runId: number } | { ok: false; message: string };
