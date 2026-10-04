import "server-only";
import { PoolClient } from "pg";
import { upsertFranchiseLink, removeFranchiseLink } from "@/lib/repository/franchise";
import { getItemGenreSelection, setItemGenres } from "@/lib/repository/genre";
import { upsertItemUrl, removeItemUrl } from "@/lib/repository/url";
import { franchiseKey, genreKey } from "@/lib/helpers/lockableField";
import { ProviderDetail } from "@/lib/provider/provider";
import { DetailsInput, GenreSelection, ItemType } from "@/types/item";
import { MetadataMatch } from "@/types/metadata";

export type StoredCommonDetails = {
    title: string;
    release_year: number | null;
    synopsis: string | null;
    locked_field: string[];
    genres: GenreSelection;
    franchise_name: string | null;
    franchise_order: number | null;
};

export function textOrNull(value: string): string | null {
    return value.trim() || null;
}

export async function readCommonDetails(client: PoolClient, id: number): Promise<StoredCommonDetails> {
    const result = await client.query(
        `SELECT
       collectionItem.title,
       collectionItem.release_year,
       collectionItem.synopsis,
       collectionItem.locked_field,
       franchise.name AS franchise_name,
       franchiseItem.franchise_order
     FROM collection_item collectionItem
     LEFT JOIN franchise_item franchiseItem ON franchiseItem.collection_item_id = collectionItem.id
     LEFT JOIN franchise ON franchise.id = franchiseItem.franchise_id
     WHERE collectionItem.id = $1
     FOR UPDATE OF collectionItem`,
        [id]
    );
    if (result.rows.length === 0) throw new Error(`Item ${id} not found`);
    const row = result.rows[0];
    return {
        title: row.title,
        release_year: row.release_year ?? null,
        synopsis: row.synopsis ?? null,
        locked_field: row.locked_field,
        genres: await getItemGenreSelection(id, client),
        franchise_name: row.franchise_name ?? null,
        franchise_order: row.franchise_order ?? null,
    };
}

export function storedCommonLocks(stored: StoredCommonDetails) {
    return {
        title: stored.title,
        release_year: stored.release_year,
        synopsis: stored.synopsis,
        genre: genreKey(stored.genres),
        franchise: franchiseKey(stored.franchise_name, stored.franchise_order),
    };
}

export function submittedCommonLocks(input: DetailsInput) {
    return {
        title: input.title,
        release_year: input.releaseYear,
        synopsis: input.synopsis,
        genre: genreKey(input.genres),
        franchise: franchiseKey(input.franchiseName, input.franchiseOrder),
    };
}

export async function writeCommonDetails(client: PoolClient, id: number, input: DetailsInput, lockedField: string[]) {
    await client.query(
        `UPDATE collection_item
     SET title = $1, owned = $2, release_year = $3, synopsis = $4, locked_field = $5
     WHERE id = $6`,
        [input.title, input.owned, input.releaseYear, textOrNull(input.synopsis), lockedField, id]
    );
    await setItemGenres(id, input.genres, client);
    if (input.franchiseName.trim()) {
        await upsertFranchiseLink(id, input.franchiseName.trim(), input.franchiseOrder, client);
    } else {
        await removeFranchiseLink(id, client);
    }
    if (input.siteUrl.trim()) {
        await upsertItemUrl(id, input.siteUrl.trim(), input.siteLabel.trim() || null, client);
    } else {
        await removeItemUrl(id, client);
    }
}

export function providerValue(detail: ProviderDetail, field: keyof ProviderDetail["item"]): string | number | null {
    return detail.item[field] ?? null;
}

export function providerCommonLocks(detail: ProviderDetail, input: DetailsInput) {
    return {
        title: providerValue(detail, "title"),
        release_year: providerValue(detail, "release_year"),
        synopsis: providerValue(detail, "synopsis"),
        genre: genreKey(input.genres),
        franchise: franchiseKey(detail.collection?.name ?? null, detail.collection?.order ?? null),
    };
}

export function createLocks(changed: string[], match: MetadataMatch | null): string[] {
    if (!match) return [];
    return match.customGenres && !changed.includes("genre") ? [...changed, "genre"] : changed;
}

export async function insertItem(client: PoolClient, type: ItemType, input: DetailsInput): Promise<number> {
    const result = await client.query(
        `INSERT INTO collection_item (title, type, owned, release_year)
     VALUES ($1, $2, $3, $4)
     RETURNING id`,
        [input.title, type, input.owned, input.releaseYear]
    );
    return result.rows[0].id;
}
