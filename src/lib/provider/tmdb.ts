import "server-only";
import { getProviderCredentials } from "@/lib/providerSetting";
import { METADATA_REGION } from "@/lib/metadataRegion";
import { acquireToken } from "@/lib/provider/rateLimiter";
import {
    MetadataProvider,
    ProviderCollection,
    ProviderDetail,
    ProviderGenre,
    isProviderNotConfigured,
    isProviderRequestError,
    ProviderNotConfiguredError,
    ProviderRequestError,
    ProviderSearchResult,
    ProviderUnsupportedMediaError,
    yearFromDate,
} from "@/lib/provider/provider";
import { ItemType } from "@/types/item";

const BASE_URL = "https://api.themoviedb.org/3";
const SEARCH_LIMIT = 20;
const THEATRICAL_RELEASE = 3;

type TmdbMediaType = "movie" | "tv";

type TmdbGenre = { id: number; name: string };

type TmdbSearchResult = {
    id: number;
    title?: string;
    name?: string;
    release_date?: string;
    first_air_date?: string;
    overview?: string;
};

type TmdbMovie = {
    id: number;
    title: string;
    release_date?: string;
    overview?: string;
    runtime?: number | null;
    genres?: TmdbGenre[];
    belongs_to_collection?: { id: number; name: string } | null;
    credits?: { crew: { job: string; name: string }[] };
    release_dates?: {
        results: { iso_3166_1: string; release_dates: { certification: string; type: number }[] }[];
    };
};

type TmdbShow = {
    id: number;
    name: string;
    first_air_date?: string;
    overview?: string;
    number_of_seasons?: number | null;
    networks?: { name: string }[];
    status?: string;
    genres?: TmdbGenre[];
};

function tmdbType(mediaType: ItemType): TmdbMediaType {
    if (mediaType === "movie") return "movie";
    if (mediaType === "show") return "tv";
    throw new ProviderUnsupportedMediaError("tmdb", mediaType);
}

function toGenres(genres: TmdbGenre[] | undefined, mediaType: ItemType): ProviderGenre[] {
    return (genres ?? []).map((genre) => ({ provider_genre_id: String(genre.id), name: genre.name, media_type: mediaType }));
}

function certificationFor(movie: TmdbMovie, region: string): string | null {
    const entry = movie.release_dates?.results.find((result) => result.iso_3166_1 === region);
    const rated = (entry?.release_dates ?? []).filter((release) => release.certification.trim());
    const release = rated.find((candidate) => candidate.type === THEATRICAL_RELEASE) ?? rated[0];
    return release?.certification.trim() ?? null;
}

function directorsOf(movie: TmdbMovie): string | null {
    const names = (movie.credits?.crew ?? []).filter((member) => member.job === "Director").map((member) => member.name);
    return [...new Set(names)].join(", ") || null;
}

export function createTmdbClient(getToken: () => Promise<string | undefined>, region = METADATA_REGION): MetadataProvider {
    async function request<T>(path: string, params: Record<string, string> = {}): Promise<T> {
        const token = await getToken();
        if (!token) throw new ProviderNotConfiguredError("tmdb");
        await acquireToken("tmdb");
        const url = new URL(`${BASE_URL}${path}`);
        for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}`, Accept: "application/json" },
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new ProviderRequestError("tmdb", response.status, body?.status_message ?? `TMDB request failed (${response.status})`);
        }
        return response.json() as Promise<T>;
    }

    async function collectionOf(movie: TmdbMovie): Promise<ProviderCollection | null> {
        const collection = movie.belongs_to_collection;
        if (!collection) return null;
        const detail = await request<{ parts?: { id: number; release_date?: string }[] }>(`/collection/${collection.id}`);
        const parts = [...(detail.parts ?? [])].sort(
            (a, b) => (a.release_date || "9999").localeCompare(b.release_date || "9999") || a.id - b.id
        );
        const position = parts.findIndex((part) => part.id === movie.id);
        return {
            provider_id: String(collection.id),
            name: collection.name.replace(/\s+Collection$/i, "").trim() || collection.name,
            order: position === -1 ? null : position + 1,
        };
    }

    async function getMovie(providerId: string): Promise<ProviderDetail> {
        const movie = await request<TmdbMovie>(`/movie/${encodeURIComponent(providerId)}`, {
            append_to_response: "credits,release_dates",
        });
        return {
            provider: "tmdb",
            provider_id: String(movie.id),
            media_type: "movie",
            item: {
                title: movie.title,
                release_year: yearFromDate(movie.release_date),
                synopsis: movie.overview || null,
                runtime_minutes: movie.runtime || null,
                director: directorsOf(movie),
                certification: certificationFor(movie, region),
            },
            genres: toGenres(movie.genres, "movie"),
            collection: await collectionOf(movie),
            platform_ids: [],
        };
    }

    async function getShow(providerId: string): Promise<ProviderDetail> {
        const show = await request<TmdbShow>(`/tv/${encodeURIComponent(providerId)}`);
        return {
            provider: "tmdb",
            provider_id: String(show.id),
            media_type: "show",
            item: {
                title: show.name,
                release_year: yearFromDate(show.first_air_date),
                synopsis: show.overview || null,
                total_seasons: show.number_of_seasons ?? null,
                network: show.networks?.[0]?.name ?? null,
                series_status: show.status || null,
            },
            genres: toGenres(show.genres, "show"),
            collection: null,
            platform_ids: [],
        };
    }

    return {
        async search(query, mediaType): Promise<ProviderSearchResult[]> {
            const type = tmdbType(mediaType);
            if (!query.trim()) return [];
            const data = await request<{ results: TmdbSearchResult[] }>(`/search/${type}`, {
                query: query.trim(),
                include_adult: "false",
            });
            return data.results.slice(0, SEARCH_LIMIT).map((result) => ({
                provider_id: String(result.id),
                title: (type === "movie" ? result.title : result.name) ?? "",
                year: yearFromDate(type === "movie" ? result.release_date : result.first_air_date),
                overview: result.overview || null,
            }));
        },

        async getDetail(providerId, mediaType) {
            return tmdbType(mediaType) === "movie" ? getMovie(providerId) : getShow(providerId);
        },

        async testConnection() {
            try {
                await request<{ success: boolean }>("/authentication");
                return { ok: true, message: "Connected to TMDB." };
            } catch (error) {
                if (isProviderNotConfigured(error)) {
                    return { ok: false, message: "Add a TMDB API Read Access Token first." };
                }
                if (isProviderRequestError(error) && error.status === 401) {
                    return { ok: false, message: "TMDB rejected the token. Check it's the API Read Access Token, not the shorter API key." };
                }
                return { ok: false, message: `Couldn't reach TMDB: ${error instanceof Error ? error.message : String(error)}` };
            }
        },
    };
}

export const tmdb = createTmdbClient(async () => (await getProviderCredentials("tmdb")).tmdb_read_access_token);
