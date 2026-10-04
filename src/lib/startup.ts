import "server-only";
import pool from "./db";
import { migrate } from "./migrate";

let startupPromise: Promise<void> | null = null;

const processState = globalThis as typeof globalThis & { caseshelfJobsRecovered?: boolean };

async function recoverInterruptedJobs() {
    if (processState.caseshelfJobsRecovered) return;
    processState.caseshelfJobsRecovered = true;
    await pool.query(
        `UPDATE job_run SET status = 'failed', finished_at = now(), error = 'Interrupted by restart'
     WHERE status = 'running'`
    );
}

export function startup() {
    if (!startupPromise) {
        startupPromise = migrate()
            .then(recoverInterruptedJobs)
            .catch((error) => {
                console.error("Startup migration failed:", error);
                startupPromise = null;
                throw error;
            });
    }
    return startupPromise;
}
