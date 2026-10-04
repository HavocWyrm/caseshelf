export type Provider = "tmdb" | "igdb";

export type ProviderSettingKey = "tmdb_read_access_token" | "igdb_client_id" | "igdb_client_secret";

export type ProviderStatus = {
    configured: boolean;
    masked: Partial<Record<ProviderSettingKey, string>>;
};

export type ProviderStatuses = Record<Provider, ProviderStatus>;

export type ConnectionTestResult = {
    ok: boolean;
    message: string;
};
