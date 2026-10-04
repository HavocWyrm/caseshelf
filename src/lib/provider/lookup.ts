import "server-only";
import pool, { Queryable } from "@/lib/db";
import { igdb } from "@/lib/provider/igdb";
import { tmdb } from "@/lib/provider/tmdb";
import { MetadataProvider, ProviderDetail } from "@/lib/provider/provider";
import { ItemType } from "@/types/item";
import { Provider } from "@/types/setting";

export function providerFor(mediaType: ItemType): { provider: Provider; client: MetadataProvider } {
    return mediaType === "game" ? { provider: "igdb", client: igdb } : { provider: "tmdb", client: tmdb };
}

export function isItemType(value: unknown): value is ItemType {
    return value === "game" || value === "movie" || value === "show";
}

export async function igdbPlatformId(platformId: number | null | undefined, db: Queryable = pool): Promise<string | undefined> {
    if (platformId === null || platformId === undefined) return undefined;
    const result = await db.query(`SELECT igdb_platform_id FROM platform WHERE id = $1`, [platformId]);
    const id = result.rows[0]?.igdb_platform_id;
    return id === null || id === undefined ? undefined : String(id);
}

export async function fetchDetail(mediaType: ItemType, providerId: string, platformId?: number | null): Promise<ProviderDetail> {
    const { client } = providerFor(mediaType);
    const platformProviderId = mediaType === "game" ? await igdbPlatformId(platformId) : undefined;
    return client.getDetail(providerId, mediaType, { platformProviderId });
}
