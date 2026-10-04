import { GenreSelection, ItemType } from "@/types/item";

export const LOCKABLE_FIELD = {
    game: ["title", "release_year", "synopsis", "genre", "franchise", "developer", "publisher"],
    movie: ["title", "release_year", "synopsis", "genre", "franchise", "runtime_minutes", "director", "certification"],
    show: ["title", "release_year", "synopsis", "genre", "franchise", "total_seasons", "network", "series_status"],
} as const satisfies Record<ItemType, readonly string[]>;

export type LockableField<T extends ItemType = ItemType> = (typeof LOCKABLE_FIELD)[T][number];

export type LockableValues<T extends ItemType> = Record<LockableField<T>, string | number | null>;

function normalise(value: string | number | null): string | number | null {
    if (typeof value === "string") return value.trim() || null;
    if (typeof value === "number") return Number.isNaN(value) ? null : value;
    return null;
}

export function genreKey(selection: GenreSelection): string | null {
    if (selection.ids.length === 0) return null;
    const ids = selection.ids.map(Number).sort((a, b) => a - b).join(",");
    return `${ids}|${selection.primaryId === null ? "" : Number(selection.primaryId)}`;
}

export function franchiseKey(name: string | null, order: number | null): string | null {
    const trimmed = name?.trim();
    return trimmed ? `${trimmed}#${order ?? ""}` : null;
}

export function changedLockableFields<T extends ItemType>(
    type: T,
    stored: LockableValues<T>,
    submitted: LockableValues<T>
): LockableField<T>[] {
    const fields = LOCKABLE_FIELD[type] as readonly LockableField<T>[];
    return fields.filter((field) => normalise(stored[field]) !== normalise(submitted[field]));
}

export function mergeLocks(existing: string[], changed: string[]): string[] {
    return [...existing, ...changed.filter((field) => !existing.includes(field))];
}
