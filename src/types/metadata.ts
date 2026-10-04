import { Provider } from "@/types/setting";

export type MetadataSearchResult = {
    provider_id: string;
    title: string;
    year: number | null;
    overview: string | null;
};

export type MetadataPreview = {
    provider: Provider;
    provider_id: string;
    title: string | null;
    release_year: number | null;
    synopsis: string | null;
    fields: Record<string, string | number | null>;
    genres: string[];
    franchise: { name: string; order: number | null } | null;
    platformIds: number[];
};

export type MetadataError = "not_configured" | "request_failed";

export type MetadataResult<T> = { ok: true; data: T } | { ok: false; error: MetadataError; message: string };

export type MetadataMatch = {
    providerId: string;
    customGenres: boolean;
};

export type ItemMetadataState = {
    provider: Provider | null;
    provider_id: string | null;
    metadata_fetched_at: string | null;
    locked_field: string[];
};
