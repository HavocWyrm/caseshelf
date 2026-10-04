const collator = new Intl.Collator("en", { numeric: true, sensitivity: "base" });

const LEADING_ARTICLE = /^(the|a|an?)\s+/i;

export function sortableTitle(title: string): string {
    return title.replace(LEADING_ARTICLE, "");
}

export function compareTitle(a: string, b: string): number {
    return collator.compare(sortableTitle(a), sortableTitle(b)) || collator.compare(a, b);
}

export function compareText(a: string | null, b: string | null): number {
    if (a === b) return 0;
    if (a === null) return 1;
    if (b === null) return -1;
    return collator.compare(a, b);
}

export function compareNumber(
    a: number | null,
    b: number | null,
    nulls: "first" | "last" = "last"
): number {
    if (a === b) return 0;
    if (a === null) return nulls === "first" ? -1 : 1;
    if (b === null) return nulls === "first" ? 1 : -1;
    return a - b;
}
