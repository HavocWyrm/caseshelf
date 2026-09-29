import { migrate } from "./migrate";

let startupPromise: Promise<void> | null = null;

export function startup() {
    if (!startupPromise) {
        startupPromise = migrate().catch((error) => {
            console.error("Startup migration failed:", error);
            startupPromise = null;
            throw error;
        });
    }
    return startupPromise;
}
