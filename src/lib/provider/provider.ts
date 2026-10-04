import "server-only";
import { LockableField } from "@/lib/helpers/lockableField";
import { ItemType } from "@/types/item";
import { ConnectionTestResult, Provider } from "@/types/setting";

export type ProviderSearchResult = {
    provider_id: string;
    title: string;
    year: number | null;
    overview: string | null;
};

export type ProviderGenre = {
    provider_genre_id: string;
    name: string;
    media_type: ItemType;
};

export type ProviderCollection = {
    provider_id: string;
    name: string;
    order: number | null;
};

export type ProviderLookupOptions = {
    platformProviderId?: string;
};

export type ProviderItemRecord = Partial<Record<Exclude<LockableField, "genre" | "franchise">, string | number | null>>;

export type ProviderDetail = {
    provider: Provider;
    provider_id: string;
    media_type: ItemType;
    item: ProviderItemRecord;
    genres: ProviderGenre[];
    collection: ProviderCollection | null;
    platform_ids: string[];
};

export interface MetadataProvider {
    search(query: string, mediaType: ItemType, options?: ProviderLookupOptions): Promise<ProviderSearchResult[]>;
    getDetail(providerId: string, mediaType: ItemType, options?: ProviderLookupOptions): Promise<ProviderDetail>;
    testConnection(): Promise<ConnectionTestResult>;
}

export class ProviderNotConfiguredError extends Error {
    readonly code = "PROVIDER_NOT_CONFIGURED";
    constructor(readonly provider: Provider) {
        super(`${provider} credentials are not configured`);
        this.name = "ProviderNotConfiguredError";
    }
}

export class ProviderUnsupportedMediaError extends Error {
    readonly code = "PROVIDER_UNSUPPORTED_MEDIA";
    constructor(readonly provider: Provider, readonly mediaType: ItemType) {
        super(`${provider} does not provide ${mediaType} metadata`);
        this.name = "ProviderUnsupportedMediaError";
    }
}

export class ProviderRequestError extends Error {
    readonly code = "PROVIDER_REQUEST_FAILED";
    constructor(readonly provider: Provider, readonly status: number, message: string) {
        super(message);
        this.name = "ProviderRequestError";
    }
}

export function isProviderNotConfigured(error: unknown): error is ProviderNotConfiguredError {
    return error instanceof Error && (error as { code?: unknown }).code === "PROVIDER_NOT_CONFIGURED";
}

export function isProviderRequestError(error: unknown): error is ProviderRequestError {
    return error instanceof Error && (error as { code?: unknown }).code === "PROVIDER_REQUEST_FAILED";
}

export function yearFromDate(date: string | null | undefined): number | null {
    const year = Number(date?.slice(0, 4));
    return Number.isInteger(year) && year > 0 ? year : null;
}
