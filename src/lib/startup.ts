import { migrate } from "./migrate";

let started = false;

export async function startup() {
    if (started) return;
    started = true;
    await migrate();
}