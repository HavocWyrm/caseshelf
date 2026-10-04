import "server-only";
import { getProviderCredentials } from "@/lib/providerSetting";
import { acquireToken } from "@/lib/provider/rateLimiter";
import {
    isProviderNotConfigured,
    isProviderRequestError,
    MetadataProvider,
    ProviderCollection,
    ProviderDetail,
    ProviderGenre,
    ProviderNotConfiguredError,
    ProviderLookupOptions,
    ProviderRequestError,
    ProviderSearchResult,
    ProviderUnsupportedMediaError,
} from "@/lib/provider/provider";
import { ItemType } from "@/types/item";

const TOKEN_URL = "https://id.twitch.tv/oauth2/token";
const API_URL = "https://api.igdb.com/v4";
const SEARCH_LIMIT = 20;
const TOKEN_EXPIRY_MARGIN_MS = 60_000;

export type IgdbCredentials = { clientId?: string; clientSecret?: string };

type Named = { id: number; name: string };

type IgdbSearchResult = {
    id: number;
    name: string;
    first_release_date?: number;
    summary?: string;
    release_dates?: { date?: number; y?: number; platform?: number }[];
};

type IgdbGame = IgdbSearchResult & {
    genres?: Named[];
    themes?: Named[];
    involved_companies?: { developer: boolean; publisher: boolean; company?: Named }[];
    franchise?: Named;
    franchises?: Named[];
    collections?: Named[];
    platforms?: number[];
};

const SEARCH_FIELDS = "name, first_release_date, summary, release_dates.date, release_dates.y, release_dates.platform";

const DETAIL_FIELDS = [
    "name", "summary", "first_release_date",
    "genres.name", "themes.name",
    "involved_companies.developer", "involved_companies.publisher", "involved_companies.company.name",
    "franchise.name", "franchises.name", "collections.name",
    "release_dates.date", "release_dates.y", "release_dates.platform", "platforms",
].join(", ");

function assertGame(mediaType: ItemType) {
    if (mediaType !== "game") throw new ProviderUnsupportedMediaError("igdb", mediaType);
}

function quote(value: string): string {
    return `"${value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')}"`;
}

function yearFromUnix(seconds: number | undefined): number | null {
    return seconds ? new Date(seconds * 1000).getUTCFullYear() : null;
}

function companiesWhere(game: IgdbGame, role: "developer" | "publisher"): string | null {
    const names = (game.involved_companies ?? [])
        .filter((involved) => involved[role] && involved.company)
        .map((involved) => involved.company!.name);
    return [...new Set(names)].join(", ") || null;
}

function genresOf(game: IgdbGame): ProviderGenre[] {
    return [
        ...(game.genres ?? []).map((genre) => ({ provider_genre_id: `genre:${genre.id}`, name: genre.name, media_type: "game" as const })),
        ...(game.themes ?? []).map((theme) => ({ provider_genre_id: `theme:${theme.id}`, name: theme.name, media_type: "game" as const })),
    ];
}

type Grouping = { field: "collections" | "franchises"; group: Named; members?: { id: number }[] };

function sameName(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

function platformIdOf(options: ProviderLookupOptions | undefined): number | null {
    const id = options?.platformProviderId;
    if (id === undefined) return null;
    if (!/^\d+$/.test(id)) throw new ProviderRequestError("igdb", 400, `Invalid IGDB platform id: ${id}`);
    return Number(id);
}

function releaseYearOf(game: IgdbSearchResult, platformId: number | null): number | null {
    const years = (game.release_dates ?? [])
        .filter((release) => platformId !== null && release.platform === platformId)
        .map((release) => (release.date ? yearFromUnix(release.date) : release.y ?? null))
        .filter((year): year is number => year !== null);
    return years.length > 0 ? Math.min(...years) : yearFromUnix(game.first_release_date);
}

export function createIgdbClient(getCredentials: () => Promise<IgdbCredentials>): MetadataProvider {
    let cached: { key: string; token: string; expiresAt: number } | null = null;
    let pending: { key: string; promise: Promise<string> } | null = null;

    async function credentials() {
        const { clientId, clientSecret } = await getCredentials();
        if (!clientId || !clientSecret) throw new ProviderNotConfiguredError("igdb");
        return { clientId, clientSecret, key: `${clientId}:${clientSecret}` };
    }

    async function fetchToken(clientId: string, clientSecret: string): Promise<{ token: string; expiresAt: number }> {
        const response = await fetch(TOKEN_URL, {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({ client_id: clientId, client_secret: clientSecret, grant_type: "client_credentials" }),
        });
        const body = await response.json().catch(() => null);
        if (!response.ok || !body?.access_token) {
            throw new ProviderRequestError("igdb", response.status, `Twitch token request failed: ${body?.message ?? response.status}`);
        }
        return { token: body.access_token, expiresAt: Date.now() + body.expires_in * 1000 - TOKEN_EXPIRY_MARGIN_MS };
    }

    async function accessToken(clientId: string, clientSecret: string, key: string): Promise<string> {
        if (cached && cached.key === key && cached.expiresAt > Date.now()) return cached.token;
        if (pending?.key === key) return pending.promise;
        const promise = fetchToken(clientId, clientSecret)
            .then(({ token, expiresAt }) => {
                cached = { key, token, expiresAt };
                return token;
            })
            .finally(() => {
                if (pending?.promise === promise) pending = null;
            });
        pending = { key, promise };
        return promise;
    }

    async function mainGamesIn(field: Grouping["field"], id: number): Promise<{ id: number }[]> {
        return query<{ id: number }[]>(
            "games",
            `fields id; where ${field} = (${id}) & game_type = 0 & version_parent = null; sort first_release_date asc; limit 500;`
        );
    }

    async function collectionOf(game: IgdbGame): Promise<ProviderCollection | null> {
        const franchise = game.franchise ?? game.franchises?.[0];
        const collections = game.collections ?? [];
        let grouping: Grouping | null = null;

        const named = franchise && collections.find((collection) => sameName(collection.name, franchise.name));
        if (named) {
            grouping = { field: "collections", group: named };
        } else if (collections.length > 0) {
            for (const collection of collections) {
                const members = await mainGamesIn("collections", collection.id);
                if (!grouping || members.length > (grouping.members?.length ?? 0)) {
                    grouping = { field: "collections", group: collection, members };
                }
            }
        } else if (franchise) {
            grouping = { field: "franchises", group: franchise };
        }
        if (!grouping) return null;

        const members = grouping.members ?? await mainGamesIn(grouping.field, grouping.group.id);
        const position = members.findIndex((member) => member.id === game.id);
        return {
            provider_id: `${grouping.field === "collections" ? "collection" : "franchise"}:${grouping.group.id}`,
            name: grouping.group.name,
            order: position === -1 ? null : position + 1,
        };
    }

    async function query<T>(endpoint: string, body: string, retried = false): Promise<T> {
        const { clientId, clientSecret, key } = await credentials();
        const token = await accessToken(clientId, clientSecret, key);
        await acquireToken("igdb");
        const response = await fetch(`${API_URL}/${endpoint}`, {
            method: "POST",
            headers: { "Client-ID": clientId, Authorization: `Bearer ${token}`, Accept: "application/json" },
            body,
        });
        if (response.status === 401 && !retried) {
            cached = null;
            return query<T>(endpoint, body, true);
        }
        if (!response.ok) {
            const detail = await response.text().catch(() => "");
            throw new ProviderRequestError("igdb", response.status, `IGDB request failed (${response.status}) ${detail}`.trim());
        }
        return response.json() as Promise<T>;
    }

    return {
        async search(searchQuery, mediaType, options): Promise<ProviderSearchResult[]> {
            assertGame(mediaType);
            const platformId = platformIdOf(options);
            if (!searchQuery.trim()) return [];
            const platformFilter = platformId === null ? "" : ` where platforms = (${platformId});`;
            const results = await query<IgdbSearchResult[]>(
                "games",
                `search ${quote(searchQuery.trim())}; fields ${SEARCH_FIELDS};${platformFilter} limit ${SEARCH_LIMIT};`
            );
            return results.map((game) => ({
                provider_id: String(game.id),
                title: game.name,
                year: releaseYearOf(game, platformId),
                overview: game.summary || null,
            }));
        },

        async getDetail(providerId, mediaType, options): Promise<ProviderDetail> {
            assertGame(mediaType);
            const platformId = platformIdOf(options);
            if (!/^\d+$/.test(providerId)) throw new ProviderRequestError("igdb", 400, `Invalid IGDB game id: ${providerId}`);
            const [game] = await query<IgdbGame[]>("games", `fields ${DETAIL_FIELDS}; where id = ${providerId};`);
            if (!game) throw new ProviderRequestError("igdb", 404, `IGDB game ${providerId} not found`);
            return {
                provider: "igdb",
                provider_id: String(game.id),
                media_type: "game",
                item: {
                    title: game.name,
                    release_year: releaseYearOf(game, platformId),
                    synopsis: game.summary || null,
                    developer: companiesWhere(game, "developer"),
                    publisher: companiesWhere(game, "publisher"),
                },
                genres: genresOf(game),
                collection: await collectionOf(game),
                platform_ids: (game.platforms ?? []).map(String),
            };
        },

        async testConnection() {
            try {
                await query<unknown[]>("games", "fields id; limit 1;");
                return { ok: true, message: "Connected to IGDB." };
            } catch (error) {
                if (isProviderNotConfigured(error)) {
                    return { ok: false, message: "Add an IGDB Client ID and Client Secret first." };
                }
                if (isProviderRequestError(error) && error.message.startsWith("Twitch token request failed")) {
                    return { ok: false, message: "Twitch rejected the Client ID or Client Secret." };
                }
                return { ok: false, message: `Couldn't reach IGDB: ${error instanceof Error ? error.message : String(error)}` };
            }
        },
    };
}

export const igdb = createIgdbClient(async () => {
    const values = await getProviderCredentials("igdb");
    return { clientId: values.igdb_client_id, clientSecret: values.igdb_client_secret };
});
