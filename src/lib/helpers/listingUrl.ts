const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);

export function normaliseListingUrl(siteUrl: string): string {
    const trimmed = siteUrl.trim();
    const withScheme = /^[a-z][a-z0-9+.-]*:/i.test(trimmed) ? trimmed : `https://${trimmed}`;
    let url: URL;
    try {
        url = new URL(withScheme);
    } catch {
        throw new Error("Listing URL is not a valid web address.");
    }
    if (!ALLOWED_PROTOCOLS.has(url.protocol)) throw new Error("Listing URL must start with http:// or https://.");
    return url.toString();
}

export function listingUrlError(siteUrl: string): string | null {
    if (!siteUrl.trim()) return null;
    try {
        normaliseListingUrl(siteUrl);
        return null;
    } catch (error) {
        return error instanceof Error ? error.message : String(error);
    }
}
