"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { getProviderStatuses } from "@/lib/providerSetting";
import { applyMetadata } from "@/lib/provider/applyMetadata";
import { fetchDetail, igdbPlatformId, isItemType, providerFor } from "@/lib/provider/lookup";
import { isProviderNotConfigured } from "@/lib/provider/provider";
import { LOCKABLE_FIELD } from "@/lib/helpers/lockableField";
import { ItemType } from "@/types/item";
import { MetadataPreview, MetadataResult, MetadataSearchResult } from "@/types/metadata";

const COMMON_FIELDS = new Set(["title", "release_year", "synopsis", "genre", "franchise"]);

function assertItemType(mediaType: unknown): asserts mediaType is ItemType {
    if (!isItemType(mediaType)) throw new Error(`Unknown media type: ${String(mediaType)}`);
}

function failure(error: unknown): MetadataResult<never> {
    if (isProviderNotConfigured(error)) {
        return { ok: false, error: "not_configured", message: "The metadata provider isn't configured." };
    }
    return { ok: false, error: "request_failed", message: error instanceof Error ? error.message : String(error) };
}

export async function getMetadataAvailability(mediaType: ItemType): Promise<boolean> {
    assertItemType(mediaType);
    const statuses = await getProviderStatuses();
    return statuses[providerFor(mediaType).provider].configured;
}

export async function searchMetadata(
    mediaType: ItemType,
    query: string,
    platformId?: number | null
): Promise<MetadataResult<MetadataSearchResult[]>> {
    assertItemType(mediaType);
    try {
        await startup();
        const platformProviderId = mediaType === "game" ? await igdbPlatformId(platformId) : undefined;
        const results = await providerFor(mediaType).client.search(String(query), mediaType, { platformProviderId });
        return { ok: true, data: results };
    } catch (error) {
        return failure(error);
    }
}

export async function previewMetadata(
    mediaType: ItemType,
    providerId: string,
    platformId?: number | null
): Promise<MetadataResult<MetadataPreview>> {
    assertItemType(mediaType);
    try {
        await startup();
        const detail = await fetchDetail(mediaType, String(providerId), platformId);
        const fields = Object.fromEntries(
            LOCKABLE_FIELD[mediaType]
                .filter((field) => !COMMON_FIELDS.has(field))
                .map((field) => [field, detail.item[field as keyof typeof detail.item] ?? null])
        );
        let platformIds: number[] = [];
        if (mediaType === "game" && detail.platform_ids.length > 0) {
            const result = await pool.query(
                `SELECT id::int AS id FROM platform WHERE enabled = true AND igdb_platform_id = ANY($1::int[]) ORDER BY name`,
                [detail.platform_ids.map(Number)]
            );
            platformIds = result.rows.map((row) => row.id);
        }
        return {
            ok: true,
            data: {
                provider: detail.provider,
                provider_id: detail.provider_id,
                title: typeof detail.item.title === "string" ? detail.item.title : null,
                release_year: typeof detail.item.release_year === "number" ? detail.item.release_year : null,
                synopsis: typeof detail.item.synopsis === "string" ? detail.item.synopsis : null,
                fields,
                genres: detail.genres.map((genre) => genre.name),
                franchise: detail.collection ? { name: detail.collection.name, order: detail.collection.order } : null,
                platformIds,
            },
        };
    } catch (error) {
        return failure(error);
    }
}

export async function unlockField(itemId: number, field: string) {
    await startup();
    const result = await pool.query(`SELECT type FROM collection_item WHERE id = $1`, [itemId]);
    const type = result.rows[0]?.type;
    if (!isItemType(type)) throw new Error(`Item ${itemId} not found`);
    if (!(LOCKABLE_FIELD[type] as readonly string[]).includes(field)) throw new Error(`${field} is not lockable`);
    await pool.query(
        `UPDATE collection_item SET locked_field = array_remove(locked_field, $1) WHERE id = $2`,
        [field, itemId]
    );
}

// Loads the item's type, platform (games) and current match.
async function itemForRefresh(itemId: number) {
    const result = await pool.query(
        `SELECT collectionItem.type, collectionItem.provider_id, game.platform_id
     FROM collection_item collectionItem
     LEFT JOIN game ON game.collection_item_id = collectionItem.id
     WHERE collectionItem.id = $1`,
        [itemId]
    );
    const row = result.rows[0];
    if (!row || !isItemType(row.type)) throw new Error(`Item ${itemId} not found`);
    return { type: row.type as ItemType, providerId: row.provider_id as string | null, platformId: row.platform_id as number | null };
}

// Fetches the current match again and applies it, respecting locks.
export async function refreshMetadata(itemId: number): Promise<MetadataResult<null>> {
    try {
        await startup();
        const item = await itemForRefresh(itemId);
        if (!item.providerId) return { ok: false, error: "request_failed", message: "This item isn't matched to a provider yet." };
        await applyMetadata(itemId, await fetchDetail(item.type, item.providerId, item.platformId));
        return { ok: true, data: null };
    } catch (error) {
        return failure(error);
    }
}

// Points the item at a different provider record and applies it; existing locks are kept.
export async function rematchItem(itemId: number, providerId: string): Promise<MetadataResult<null>> {
    try {
        await startup();
        const item = await itemForRefresh(itemId);
        await applyMetadata(itemId, await fetchDetail(item.type, String(providerId), item.platformId));
        return { ok: true, data: null };
    } catch (error) {
        return failure(error);
    }
}
