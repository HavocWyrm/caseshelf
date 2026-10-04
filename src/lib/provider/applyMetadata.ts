import "server-only";
import { PoolClient } from "pg";
import { withTransaction } from "@/lib/db";
import { startup } from "@/lib/startup";
import { LOCKABLE_FIELD, LockableField } from "@/lib/helpers/lockableField";
import { setItemGenres } from "@/lib/repository/genre";
import { upsertFranchiseLink } from "@/lib/repository/franchise";
import { ProviderDetail, ProviderGenre } from "@/lib/provider/provider";
import { ItemType } from "@/types/item";
import { Provider } from "@/types/setting";

type ScalarField = Exclude<LockableField, "genre" | "franchise">;

const FIELD_TABLE = {
    title: "collection_item",
    release_year: "collection_item",
    synopsis: "collection_item",
    developer: "type",
    publisher: "type",
    runtime_minutes: "type",
    director: "type",
    certification: "type",
    total_seasons: "type",
    network: "type",
    series_status: "type",
} as const satisfies Record<ScalarField, "collection_item" | "type">;

const TYPE_TABLE: Record<ItemType, string> = { game: "game", movie: "movie", show: "show" };

const PROVIDER_MEDIA: Record<Provider, readonly ItemType[]> = { igdb: ["game"], tmdb: ["movie", "show"] };

function hasValue(value: unknown): value is string | number {
    return typeof value === "number" ? !Number.isNaN(value) : typeof value === "string" && value.trim() !== "";
}

async function resolveGenre(client: PoolClient, provider: Provider, genre: ProviderGenre, retried = false): Promise<number> {
    const byProviderId = await client.query(
        `SELECT id::int AS id FROM genre WHERE provider = $1 AND provider_genre_id = $2`,
        [provider, genre.provider_genre_id]
    );
    if (byProviderId.rows[0]) return byProviderId.rows[0].id;

    const byName = await client.query(
        `SELECT id::int AS id, provider FROM genre WHERE media_type = $1 AND lower(name) = lower($2)`,
        [genre.media_type, genre.name]
    );
    const existing = byName.rows[0];
    if (existing) {
        if (existing.provider === null) {
            await client.query(
                `UPDATE genre SET provider = $1, provider_genre_id = $2 WHERE id = $3`,
                [provider, genre.provider_genre_id, existing.id]
            );
        }
        return existing.id;
    }

    const inserted = await client.query(
        `INSERT INTO genre (media_type, name, provider, provider_genre_id)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT DO NOTHING
     RETURNING id::int AS id`,
        [genre.media_type, genre.name.trim(), provider, genre.provider_genre_id]
    );
    if (inserted.rows[0]) return inserted.rows[0].id;
    if (retried) throw new Error(`Could not resolve ${provider} genre ${genre.provider_genre_id} (${genre.name})`);
    return resolveGenre(client, provider, genre, true);
}

export async function applyMetadata(itemId: number, detail: ProviderDetail, client?: PoolClient): Promise<void> {
    await startup();
    if (client) return writeMetadata(client, itemId, detail);
    await withTransaction((transaction) => writeMetadata(transaction, itemId, detail));
}

async function writeMetadata(client: PoolClient, itemId: number, detail: ProviderDetail): Promise<void> {
    const itemResult = await client.query(
        `SELECT type, locked_field FROM collection_item WHERE id = $1 FOR UPDATE`,
        [itemId]
    );
    const row = itemResult.rows[0];
    if (!row) throw new Error(`Item ${itemId} not found`);
    const type = row.type as ItemType;
    const locked = new Set<string>(row.locked_field);
    if (detail.media_type !== type) {
        throw new Error(`Cannot apply ${detail.media_type} metadata to ${type} item ${itemId}`);
    }
    if (!PROVIDER_MEDIA[detail.provider].includes(type)) {
        throw new Error(`${detail.provider} does not provide ${type} metadata`);
    }

    const itemSets = ["provider = $1", "provider_id = $2", "metadata_fetched_at = now()"];
    const itemValues: unknown[] = [detail.provider, detail.provider_id];
    const typeSets: string[] = [];
    const typeValues: unknown[] = [];
    for (const field of LOCKABLE_FIELD[type] as readonly LockableField[]) {
        if (field === "genre" || field === "franchise" || locked.has(field)) continue;
        const value = detail.item[field];
        if (!hasValue(value)) continue;
        const normalised = typeof value === "string" ? value.trim() : value;
        if (FIELD_TABLE[field] === "collection_item") {
            itemValues.push(normalised);
            itemSets.push(`${field} = $${itemValues.length}`);
        } else {
            typeValues.push(normalised);
            typeSets.push(`${field} = $${typeValues.length}`);
        }
    }
    itemValues.push(itemId);
    await client.query(
        `UPDATE collection_item SET ${itemSets.join(", ")} WHERE id = $${itemValues.length}`,
        itemValues
    );
    if (typeSets.length > 0) {
        typeValues.push(itemId);
        await client.query(
            `UPDATE ${TYPE_TABLE[type]} SET ${typeSets.join(", ")} WHERE collection_item_id = $${typeValues.length}`,
            typeValues
        );
    }

    if (!locked.has("genre") && detail.genres.length > 0) {
        const ids: number[] = [];
        for (const genre of detail.genres) {
            const id = await resolveGenre(client, detail.provider, genre);
            if (!ids.includes(id)) ids.push(id);
        }
        await setItemGenres(itemId, { ids, primaryId: ids[0] }, client);
    }

    if (!locked.has("franchise") && detail.collection) {
        await upsertFranchiseLink(itemId, detail.collection.name.trim(), detail.collection.order, client);
    }
}
