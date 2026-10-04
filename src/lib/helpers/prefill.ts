export function mergeUntouched<T extends Record<string, unknown>>(
    form: T,
    previous: Partial<T> | null,
    next: Partial<T>
): T {
    const merged = { ...form };
    for (const key of Object.keys(next) as (keyof T)[]) {
        const untouched = previous ? form[key] === previous[key] : form[key] === "";
        if (untouched) merged[key] = next[key] as T[keyof T];
    }
    return merged;
}
