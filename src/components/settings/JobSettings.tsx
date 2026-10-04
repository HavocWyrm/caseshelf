"use client";
import { useEffect, useState } from "react";
import { getJobOverviews, runJobNow, saveJobStaleDays } from "@/actions/pages/job";
import { JobName, JobOverview, JobRun } from "@/types/job";
import styles from "@/styles/settings.module.css";
import formStyles from "@/styles/form.module.css";

const POLL_MS = 2000;

type Props = {
    jobs: JobOverview[];
    staleDays: number;
};

const STATUS_LABEL = { running: "Running", success: "Succeeded", failed: "Failed" } as const;

function durationOf(run: JobRun): string | null {
    if (!run.finished_at) return null;
    const seconds = Math.round((Date.parse(run.finished_at) - Date.parse(run.started_at)) / 1000);
    return seconds < 60 ? `${seconds}s` : `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function summaryText(run: JobRun): string {
    const parts = Object.entries(run.summary).map(([key, count]) => `${key.replace(/([A-Z])/g, " $1").toLowerCase()} ${count}`);
    return [`${run.processed_count} processed`, ...parts].join(" · ");
}

export default function JobSettings({ jobs: initialJobs, staleDays: initialStaleDays }: Props) {
    const [jobs, setJobs] = useState(initialJobs);
    const [messages, setMessages] = useState<Partial<Record<JobName, string>>>({});
    const [staleDays, setStaleDays] = useState(String(initialStaleDays));
    const [staleDaysSaved, setStaleDaysSaved] = useState(initialStaleDays);

    const anyRunning = jobs.some((job) => job.lastRun?.status === "running");

    useEffect(() => {
        if (!anyRunning) return;
        const timer = setInterval(async () => {
            const overview = await getJobOverviews();
            setJobs(overview.jobs);
        }, POLL_MS);
        return () => clearInterval(timer);
    }, [anyRunning]);

    const handleRun = async (name: JobName) => {
        setMessages((prev) => ({ ...prev, [name]: undefined }));
        const result = await runJobNow(name);
        if (!result.ok) setMessages((prev) => ({ ...prev, [name]: result.message }));
        setJobs((await getJobOverviews()).jobs);
    };

    const handleSaveStaleDays = async (e: React.SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            setStaleDaysSaved(await saveJobStaleDays(Number(staleDays)));
            setMessages((prev) => ({ ...prev, refresh_stale: undefined }));
        } catch (error) {
            setMessages((prev) => ({ ...prev, refresh_stale: error instanceof Error ? error.message : String(error) }));
        }
    };

    return (
        <>
            {jobs.map((job) => {
                const run = job.lastRun;
                const isRunning = run?.status === "running";
                return (
                    <section key={job.name} className={styles.section}>
                        <div className={styles.providerHeader}>
                            <h2 className={styles.sectionTitle}>{job.title}</h2>
                            <span className={`${styles.statusBadge} ${!run ? styles.statusIdle
                                    : run.status === "success" ? styles.statusConfigured
                                        : run.status === "failed" ? styles.statusFailed
                                            : styles.statusRunning
                                }`}>
                                {run ? STATUS_LABEL[run.status] : "Never run"}
                            </span>
                        </div>
                        <p className={styles.sectionDescription}>{job.description}</p>

                        {run && (
                            <p className={styles.jobRunDetail}>
                                Last run{" "}
                                <time dateTime={run.started_at} suppressHydrationWarning>
                                    {new Date(run.started_at).toLocaleString()}
                                </time>
                                {durationOf(run) && <> · took {durationOf(run)}</>}
                                <br />
                                {summaryText(run)}
                            </p>
                        )}
                        {run?.error && <p className={styles.jobError}>{run.error}</p>}

                        {job.name === "refresh_stale" && (
                            <form className={styles.staleDaysForm} onSubmit={handleSaveStaleDays}>
                                <label className={styles.credentialLabel} htmlFor="staleDays">Refresh items older than (days)</label>
                                <div className={styles.providerActions}>
                                    <input
                                        id="staleDays"
                                        className={`${formStyles.input} ${styles.staleDaysInput}`}
                                        type="number"
                                        min={1}
                                        max={3650}
                                        value={staleDays}
                                        onChange={(e) => setStaleDays(e.target.value)}
                                    />
                                    <button type="submit" className="btn-outline" disabled={Number(staleDays) === staleDaysSaved}>
                                        Save
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className={styles.providerActions}>
                            <button type="button" className="btn" onClick={() => handleRun(job.name)} disabled={isRunning}>
                                {isRunning ? "Running…" : "Run now"}
                            </button>
                        </div>
                        {messages[job.name] && <p className={styles.jobError} role="alert">{messages[job.name]}</p>}
                    </section>
                );
            })}
        </>
    );
}
