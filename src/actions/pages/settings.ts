"use server";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { Genre, ItemType } from "@/types/item";
import { ConnectionTestResult, ProviderStatuses } from "@/types/setting";
import { clearProviderValues, getProviderCredentialsWith, getProviderStatuses, isProvider, saveProviderValues } from "@/lib/providerSetting";
import { createIgdbClient } from "@/lib/provider/igdb";
import { createTmdbClient } from "@/lib/provider/tmdb";

type SortableTable = "platform" | "genre";

export async function getPlatformsWithStatus() {
    await startup();
    const result = await pool.query(`
    SELECT id, name, enabled FROM platform ORDER BY sort_order NULLS LAST, name
  `);
    return result.rows as { id: number; name: string; enabled: boolean }[];
}

export async function getFormatsWithStatus() {
    await startup();
    const result = await pool.query(`
    SELECT id, name, enabled FROM format ORDER BY name
  `);
    return result.rows as { id: number; name: string; enabled: boolean }[];
}

export async function togglePlatform(id: number, enabled: boolean) {
    await startup();
    await pool.query(
        `UPDATE platform SET enabled = $1 WHERE id = $2`,
        [enabled, id]
    );
}

export async function toggleFormat(id: number, enabled: boolean) {
    await startup();
    await pool.query(
        `UPDATE format SET enabled = $1 WHERE id = $2`,
        [enabled, id]
    );
}

export async function getGenresByPriority(mediaType: ItemType): Promise<Genre[]> {
    await startup();
    const result = await pool.query(
        `SELECT id, name FROM genre WHERE media_type = $1 ORDER BY sort_order NULLS LAST, name`,
        [mediaType]
    );
    return result.rows;
}

async function saveSortOrder(table: SortableTable, ids: number[]) {
    await startup();
    await pool.query(
        `UPDATE ${table} SET sort_order = ordered.position
         FROM unnest($1::bigint[]) WITH ORDINALITY AS ordered(id, position)
         WHERE ${table}.id = ordered.id`,
        [ids]
    );
}

export async function savePlatformOrder(ids: number[]) {
    await saveSortOrder("platform", ids);
}

export async function saveGenreOrder(ids: number[]) {
    await saveSortOrder("genre", ids);
}

// Provider credentials: these actions only ever return masked status, never the stored values.
export async function saveProviderSettings(provider: string, values: Record<string, unknown>): Promise<ProviderStatuses> {
    if (!isProvider(provider)) throw new Error(`Unknown provider: ${provider}`);
    await saveProviderValues(provider, values);
    return getProviderStatuses();
}

export async function clearProviderSettings(provider: string): Promise<ProviderStatuses> {
    if (!isProvider(provider)) throw new Error(`Unknown provider: ${provider}`);
    await clearProviderValues(provider);
    return getProviderStatuses();
}

export async function testProviderConnection(provider: string, values: Record<string, unknown> = {}): Promise<ConnectionTestResult> {
    if (!isProvider(provider)) throw new Error(`Unknown provider: ${provider}`);
    const typed = values !== null && typeof values === "object" ? values : {};
    if (provider === "tmdb") {
        return createTmdbClient(async () => (await getProviderCredentialsWith("tmdb", typed)).tmdb_read_access_token).testConnection();
    }
    return createIgdbClient(async () => {
        const credentials = await getProviderCredentialsWith("igdb", typed);
        return { clientId: credentials.igdb_client_id, clientSecret: credentials.igdb_client_secret };
    }).testConnection();
}
