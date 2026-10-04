import "server-only";
import pool from "@/lib/db";
import { startup } from "@/lib/startup";
import { Provider, ProviderSettingKey, ProviderStatus, ProviderStatuses } from "@/types/setting";

export const PROVIDER_SETTING = {
    tmdb: ["tmdb_read_access_token"],
    igdb: ["igdb_client_id", "igdb_client_secret"],
} as const satisfies Record<Provider, readonly ProviderSettingKey[]>;

export function isProvider(value: unknown): value is Provider {
    return typeof value === "string" && Object.hasOwn(PROVIDER_SETTING, value);
}

async function readSettings(keys: readonly ProviderSettingKey[]): Promise<Partial<Record<ProviderSettingKey, string>>> {
    await startup();
    const result = await pool.query(
        `SELECT key, value FROM setting WHERE key = ANY($1::text[])`,
        [keys]
    );
    return Object.fromEntries(result.rows.map((row) => [row.key, row.value]));
}

export async function getProviderCredentials<P extends Provider>(provider: P) {
    const values = await readSettings(PROVIDER_SETTING[provider]);
    return values as Partial<Record<(typeof PROVIDER_SETTING)[P][number], string>>;
}

export async function getProviderCredentialsWith<P extends Provider>(provider: P, values: Record<string, unknown>) {
    const credentials = await getProviderCredentials(provider);
    for (const key of PROVIDER_SETTING[provider] as readonly (typeof PROVIDER_SETTING)[P][number][]) {
        const value = values[key];
        if (typeof value === "string" && value.trim()) credentials[key] = value.trim();
    }
    return credentials;
}

const MASK = "********";

export async function getProviderStatuses(): Promise<ProviderStatuses> {
    const values = await readSettings(Object.values(PROVIDER_SETTING).flat());
    const statusFor = (provider: Provider): ProviderStatus => {
        const keys = PROVIDER_SETTING[provider];
        const masked: ProviderStatus["masked"] = {};
        for (const key of keys) {
            const value = values[key];
            if (value) masked[key] = MASK;
        }
        return { configured: keys.every((key) => Boolean(values[key])), masked };
    };
    return { tmdb: statusFor("tmdb"), igdb: statusFor("igdb") };
}

export async function saveProviderValues(provider: Provider, values: Record<string, unknown>) {
    await startup();
    for (const key of PROVIDER_SETTING[provider]) {
        const value = values[key];
        if (typeof value !== "string" || !value.trim()) continue;
        await pool.query(
            `INSERT INTO setting (key, value, updated_at)
     VALUES ($1, $2, now())
     ON CONFLICT (key)
     DO UPDATE SET value = $2, updated_at = now()`,
            [key, value.trim()]
        );
    }
}

export async function clearProviderValues(provider: Provider) {
    await startup();
    await pool.query(
        `DELETE FROM setting WHERE key = ANY($1::text[])`,
        [PROVIDER_SETTING[provider]]
    );
}
